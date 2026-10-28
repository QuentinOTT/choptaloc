import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface StatsChartSectionProps {
  bookings: Booking[];
  availableYears?: string[];
}

const MONTH_NAMES_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
];

export default function StatsChartSection({ bookings, availableYears }: StatsChartSectionProps) {
  const confirmedBookings = useMemo(
    () => bookings.filter(b => b.status === "confirmed" || b.status === "completed"),
    [bookings]
  );

  // Détecter toutes les années présentes dans les données
  const years = useMemo(() => {
    if (availableYears && availableYears.length > 0) return availableYears;
    const ys = Array.from(new Set(confirmedBookings.map(b => b.startDate.slice(0,4)))).sort().reverse();
    return ys.length > 0 ? ys : [String(new Date().getFullYear())];
  }, [confirmedBookings, availableYears]);

  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Construire les données mensuelles pour la vue sélectionnée
  const monthlyData = useMemo(() => {
    const now = new Date();
    const data: {
      key: string;
      label: string;
      year: string;
      monthIndex: number;
      ca: number;
      count: number;
      isCurrent: boolean;
    }[] = [];

    const yearsToProcess = selectedYear === "all" ? years : [selectedYear];

    yearsToProcess.forEach(year => {
      for (let m = 0; m < 12; m++) {
        const key = `${year}-${String(m+1).padStart(2,'0')}`;
        const label = `${MONTH_NAMES_FR[m]} ${year}`;
        const monthBookings = confirmedBookings.filter(b => b.startDate.slice(0,7) === key);
        if (monthBookings.length === 0 && key > `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`) continue;
        // N'afficher que les mois qui ont des données ou jusqu'au mois courant
        const isCurrent = key === `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        if (monthBookings.length === 0 && !isCurrent) {
          // On l'inclut quand même si c'est dans la plage de l'année
          const yearNum = parseInt(year);
          const currentYearNum = now.getFullYear();
          if (yearNum < currentYearNum || (yearNum === currentYearNum && m <= now.getMonth())) {
            data.push({ key, label, year, monthIndex: m, ca: 0, count: 0, isCurrent });
          }
        } else {
          data.push({
            key,
            label,
            year,
            monthIndex: m,
            ca: monthBookings.reduce((s, b) => s + (Number(b.totalPrice) || 0), 0),
            count: monthBookings.length,
            isCurrent,
          });
        }
      }
    });

    return data.sort((a, b) => a.key.localeCompare(b.key));
  }, [confirmedBookings, years, selectedYear]);

  // Filtrage par mois sélectionné pour le graphique
  const chartData = useMemo(() => {
    if (!selectedMonth) return monthlyData.filter(d => d.ca > 0 || d.isCurrent);
    return monthlyData.filter(d => d.key === selectedMonth || !selectedMonth);
  }, [monthlyData, selectedMonth]);

  // Données pour le tableau
  const tableData = useMemo(() => {
    return [...monthlyData].reverse().map((d, i, arr) => {
      const prev = arr[i + 1];
      let evolution: number | null = null;
      if (prev && prev.ca > 0) {
        evolution = ((d.ca - prev.ca) / prev.ca) * 100;
      }
      return { ...d, evolution };
    });
  }, [monthlyData]);

  // Mois disponibles pour les filtres boutons
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

        {/* Filtres par année */}
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

        {/* Filtres par mois */}
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
        {/* Légende */}
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

        {/* Graphique */}
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

        {/* Tableau détaillé mois par mois */}
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
                const panierMoyen = d.count > 0 ? Math.round(d.ca / d.count) : 0;
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
                    {/* Mois */}
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
                    {/* CA */}
                    <td style={{padding:'12px 12px', textAlign:'right', color: d.ca > 0 ? '#f1f0ee' : '#4a4740', fontWeight:700}}>
                      {d.ca > 0 ? formatCA(d.ca) : '—'}
                    </td>
                    {/* Évolution M-1 */}
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
                    {/* Locations */}
                    <td style={{padding:'12px 12px', textAlign:'right', color: d.count > 0 ? '#a09d95' : '#4a4740'}}>
                      {d.count > 0 ? `${d.count} loc.` : '—'}
                    </td>
                    {/* Panier moyen */}
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
