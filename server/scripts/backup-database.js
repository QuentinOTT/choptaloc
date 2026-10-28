const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
require('dotenv').config();

async function main() {
  const output = process.argv[2];
  if (!output || !process.env.DB_HOST || !process.env.DB_NAME) throw new Error('Usage : node scripts/backup-database.js /chemin/prive/sauvegarde.sql (avec les variables DB du serveur).');
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true, mode: 0o700 });
  const fd = fs.openSync(output, 'wx', 0o600);
  let errors = '';
  const child = spawn(process.env.MYSQLDUMP_PATH || 'mysqldump', [
    '--host', process.env.DB_HOST, '--port', process.env.DB_PORT || '3306', '--user', process.env.DB_USER,
    '--single-transaction', '--quick', '--skip-lock-tables', '--no-tablespaces', '--skip-add-drop-table', process.env.DB_NAME,
  ], { env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD }, stdio: ['ignore', fd, 'pipe'] });
  try {
    child.stderr.on('data', data => { errors += data.toString(); });
    await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(errors || `mysqldump : ${code}`))); });
  } finally { fs.closeSync(fd); }
  if (fs.statSync(output).size < 100) throw new Error('Export vide ou incomplet.');
  const sha256 = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
  fs.writeFileSync(`${output}.json`, JSON.stringify({ host: process.env.DB_HOST, database: process.env.DB_NAME, createdAt: new Date().toISOString(), bytes: fs.statSync(output).size, sha256 }, null, 2), { flag: 'wx', mode: 0o600 });
  console.log(`Sauvegarde terminée : ${output} (SHA256 : ${sha256})`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
