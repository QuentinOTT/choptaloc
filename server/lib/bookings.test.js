const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');

async function simulate(totalPrice) {
  let handler;
  const calls = [];
  const connection = {
    beginTransaction: async () => calls.push('begin'),
    rollback: async () => calls.push('rollback'),
    commit: async () => calls.push('commit'),
    release: () => calls.push('release'),
    query: async (sql, values) => {
      calls.push({ sql, values });
      if (sql.includes('FROM cars')) return [[{ price_per_day: 70, has_promo: 1, promo_type: 'percentage', promo_value: 35 }]];
      if (sql.includes('FROM settings')) return [[]];
      if (sql.includes('FROM promo_codes')) return [[{ id: 3, is_active: 1, discount_type: 'percentage', discount_value: 10, current_uses: 0, max_uses: 2 }]];
      if (sql.includes('INSERT INTO bookings')) return [{ insertId: 42 }];
      return [{ affectedRows: 1 }];
    },
  };
  const router = new Proxy({}, { get: (_, method) => (route, fn) => { if (method === 'post' && route === '/') handler = fn; } });
  const file = path.resolve(__dirname, '../routes/bookings.js');
  const realRequire = createRequire(file);
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    require: name => name === 'express' ? { Router: () => router } : name === '../config/database' ? { getConnection: async () => connection } : name === 'node-mailjet' ? class {} : realRequire(name),
    module: { exports: {} }, process, console,
  }, { filename: file });
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ body: { carId: 4, userId: null, startDate: '2026-11-02', endDate: '2026-11-04', totalPrice, promoCode: 'TEST10' } }, response);
  return { calls, response };
}

test('réservation : total calculé côté serveur et quota dans la même transaction', async () => {
  const { calls, response } = await simulate(81.9);
  assert.equal(response.statusCode, 201);
  assert.equal(calls.find(call => call.sql?.includes('INSERT INTO bookings')).values[6], 81.9);
  assert.ok(calls.some(call => call.sql?.includes('FOR UPDATE')));
  assert.ok(calls.includes('commit'));
  assert.equal(calls[calls.length - 1], 'release');
});

test('réservation : prix périmé refusé, transaction annulée sans réservation', async () => {
  const { calls, response } = await simulate(140);
  assert.equal(response.statusCode, 409);
  assert.equal(response.body.totalPrice, 81.9);
  assert.ok(calls.includes('rollback'));
  assert.ok(!calls.some(call => call.sql?.includes('INSERT INTO bookings')));
  assert.ok(!calls.includes('commit'));
});
