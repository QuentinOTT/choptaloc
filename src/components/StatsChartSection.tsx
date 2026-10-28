import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MonthlyStat {
  monthKey: string;
  label: string;
  year: number;
  monthNum: number;
  revenue: number;
  confirmedCount: number;
  totalBookings?: number;
  averageBasket: number;
  growth: number | null;
}

interface StatsChartSectionProps {
  monthlyStats: MonthlyStat[];
}

export default function StatsChartSection({ monthlyStats }: StatsChartSectionProps) {
  const years = useMemo(() => {
    const ys = Array.from(new Set(monthlyStats.map(m => String(m.year)))).sort().reverse();
    return ys.length > 0 ? ys : [String(new Date().getFullYear())];
  }, [monthlyStats]);

  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return monthlyStats
      .filter(m => selectedYear === "all" || String(m.year) === selectedYear)
      .map(m => ({
        key: m.monthKey,
        label: m.label,
        year: String(m.year),
        monthIndex: m.monthNum - 1,
        ca: m.revenue,
        count: m.confirmedCount,
        averageBasket: m.averageBasket,
        evolution: m.growth,
        isCurrent: m.monthKey === nowKey,
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [monthlyStats, selectedYear]);

  const chartData = useMemo(() => {
    if (selectedMonth) return monthlyData.filter(d => d.key === selectedMonth);
    return monthlyData.filter(d => d.ca > 0 || d.isCurrent);
  }, [monthlyData, selectedMonth]);

  const tableData = useMemo(() => [...monthlyData].reverse(), [monthlyData]);

  const availableMonths = useMemo(() => monthlyData.filter(d => d.ca > 0), [monthlyData]);

  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(35,32,28,0.95), rgba(28,25,20,0.98))',
    border: '1px solid rgba(212,168,67,0.2)',
    borderRadius: 16,
  };

  const formatCA = (v: number) => v.toLocaleString('fr-FR') + ' €';

  return (
    <Card style={cardStyle}>
      <CardHeader>
        <CardTitle style={{color:'#f1f0ee', fontSize:17, fontWeight:700}}>Chiffre d'affaires mois par mois</CardTitle>
        <CardDescription style={{color:'#a09d95'}}>Historique complet des revenus générés par mois</CardDescription>

        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => { setSelectedYear("all"); setSelectedMonth(null); }}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: selectedYear === "all" ? '1px solid #d4a843' : '1px solid rgba(255,255,255,0.1)',
              background: selectedYear === "all" ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.04)',
              color: selectedYear === "all" ? '#d4a843' : '#a09d95',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >Toutes</button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => { setSelectedYear(y); setSelectedMonth(null); }}
              style={{
                padding: '5px 14px',
                borderRadius: 20,
                border: selectedYear === y ? '1px solid #d4a843' : '1px solid rgba(255,255,255,0.1)',
                background: selectedYear === y ? 'rgba(212,168,67,0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedYear === y ? '#d4a843' : '#a09d95',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >{y}</button>
          ))}
        </div>

        {availableMonths.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {availableMonths.map(d => (
              <button
                key={d.key}
                onClick={() => setSelectedMonth(selectedMonth === d.key ? null : d.key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: selectedMonth === d.key ? '1px solid #d4a843' : '1px solid rgba(255,255,255,0.07)',
                  background: selectedMonth === d.key ? 'rgba(212,168,67,0.12)' : 'transparent',
                  color: selectedMonth === d.key ? '#d4a843' : '#a09d95',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >{d.label}</button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex gap-4 text-xs" style={{color:'#a09d95'}}>
          <span style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:24, height:3, borderRadius:999, background:'rgba(212,168,67,0.4)', display:'inline-block'}}></span>
            Mois terminés / archivés
          </span>
          <span style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:24, height:3, borderRadius:999, background:'#d4a843', display:'inline-block'}}></span>
            Mois en cours
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData.map(d => ({
              month: d.label.split(' ')[0].substring(0,4),
              ca: Math.round(d.ca),
              isCurrent: d.isCurrent,
            }))}
            margin={{top:10, right:10, bottom:0, left:10}}
          >
            <defs>
              <linearGradient id="caGradientStats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a843" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#d4a843" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{fill:'#a09d95', fontSize:11}}
              axisLine={{stroke:'rgba(255,255,255,0.08)'}}
              tickLine={false}
            />
            <YAxis
              tick={{fill:'#a09d95', fontSize:11}}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v === 0 ? '0€' : `${(v/1000).toFixed(0)}k€`}
            />
            <Tooltip
              contentStyle={{background:'rgba(18,15,10,0.97)', border:'1px solid rgba(212,168,67,0.35)', borderRadius:10, color:'#f1f0ee', padding:'10px 14px'}}
              formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'CA']}
              labelStyle={{color:'#d4a843', fontWeight:700, marginBottom:4}}
            />
            <Area
              type="monotone"
              dataKey="ca"
              stroke="#d4a843"
              strokeWidth={2.5}
              fill="url(#caGradientStats)"
              dot={{fill:'#d4a843', strokeWidth:2, r:3}}
              activeDot={{r:6, fill:'#d4a843', stroke:'rgba(212,168,67,0.3)', strokeWidth:4}}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                {['MOIS','CHIFFRE D\'AFFAIRES','ÉVOLUTION (M-1)','LOCATIONS','PANIER MOYEN'].map(h => (
                  <th key={h} style={{
                    textAlign: h === 'MOIS' ? 'left' : 'right',
                    padding:'10px 12px',
                    color:'#6b6860',
                    fontSize:11,
                    fontWeight:700,
                    letterSpacing:'0.08em',
                    whiteSpace:'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((d, i) => {
                const panierMoyen = d.averageBasket || (d.count > 0 ? Math.round(d.ca / d.count) : 0);
                const isCurrentMonth = d.isCurrent;
                return (
                  <tr
                    key={d.key}
                    style={{
                      borderBottom: i < tableData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: isCurrentMonth ? 'rgba(212,168,67,0.04)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isCurrentMonth ? 'rgba(212,168,67,0.04)' : 'transparent')}
                  >
                    <td style={{padding:'12px 12px', color:'#f1f0ee', fontWeight:600, whiteSpace:'nowrap'}}>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        {d.label}
                        {isCurrentMonth && (
                          <span style={{
                            fontSize:10, fontWeight:700, color:'#d4a843',
                            background:'rgba(212,168,67,0.12)', border:'1px solid rgba(212,168,67,0.3)',
                            borderRadius:99, padding:'1px 8px', letterSpacing:'0.06em'
                          }}>En cours</span>
                        )}
                      </div>
                    </td>
                    <td style={{padding:'12px 12px', textAlign:'right', color: d.ca > 0 ? '#f1f0ee' : '#4a4740', fontWeight:700}}>
                      {d.ca > 0 ? formatCA(d.ca) : '—'}
                    </td>
                    <td style={{padding:'12px 12px', textAlign:'right'}}>
                      {d.evolution !== null && d.ca > 0 ? (
                        <span style={{
                          display:'inline-flex', alignItems:'center', gap:4,
                          color: d.evolution > 0 ? '#22c55e' : d.evolution < 0 ? '#ef4444' : '#a09d95',
                          fontWeight:700,
                        }}>
                          {d.evolution > 0 ? <TrendingUp className="w-3 h-3" /> : d.evolution < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {d.evolution > 0 ? '+' : ''}{d.evolution.toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{color:'#4a4740'}}>—</span>
                      )}
                    </td>
                    <td style={{padding:'12px 12px', textAlign:'right', color: d.count > 0 ? '#a09d95' : '#4a4740'}}>
                      {d.count > 0 ? `${d.count} loc.` : '—'}
                    </td>
                    <td style={{padding:'12px 12px', textAlign:'right', color: panierMoyen > 0 ? '#818cf8' : '#4a4740', fontWeight:600}}>
                      {panierMoyen > 0 ? `${panierMoyen.toLocaleString('fr-FR')} €` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
