import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GanttCar {
  id: string; brand: string; model: string; price: number;
  isAvailable: boolean; imageUrl?: string;
  licensePlate?: string; color?: string; tag?: string;
  maintenanceStatus?: "maintenance";
}
export interface GanttBooking {
  id: string; carId: string;
  startDate: string; endDate: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  userName?: string; userEmail?: string; userPhone?: string;
  pickupTime?: string; dropoffTime?: string;
  pickupLocation?: string; dropoffLocation?: string; notes?: string;
}
interface GlobalCalendarProps { cars: GanttCar[]; bookings: GanttBooking[]; }

type Scale = "3J" | "1S" | "2S" | "3S" | "1M" | "3M" | "1A";

interface ColDef {
  key: string;
  line1: string;       // heure "0h" | jour "LUN" | mois "AVR"
  line2: string;       // jour "14" | semaine "13-19" | année "2026"
  monthHint: string;   // "AVR" sous le today
  dayGroup: string;    // pour regrouper dans le header 3J: "LUN 14 AVR"
  rangeStart: Date;
  rangeEnd: Date;
  isCurrentPeriod: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTH_ABBR  = ["JAN","FÉV","MAR","AVR","MAI","JUI","JUL","AOÛ","SEP","OCT","NOV","DÉC"];
const DAY_ABBR    = ["LUN","MAR","MER","JEU","VEN","SAM","DIM"];
const SCALES: { id: Scale; label: string }[] = [
  { id: "3J",  label: "3J" },
  { id: "1S",  label: "1S" },
  { id: "2S",  label: "2S" },
  { id: "3S",  label: "3S" },
  { id: "1M",  label: "1M" },
  { id: "3M",  label: "3M" },
  { id: "1A",  label: "1A" },
];

// ─── Date helpers ────────────────────────────────────────────────────────────

function parseLocalDate(str: string): Date {
  const p = str.slice(0,10).split("-").map(Number);
  return new Date(p[0], p[1]-1, p[2]);
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function endOfDay(d: Date) { return new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59,59,999); }
function getMonday(d: Date) {
  const r = new Date(d); const day = r.getDay();
  r.setDate(r.getDate()-(day===0?6:day-1)); r.setHours(0,0,0,0); return r;
}
function parseTimeToMinutes(t: string): number {
  const [h,m] = t.split(":").map(Number); return h*60+(m||0);
}

// ─── Column builders ─────────────────────────────────────────────────────────

/** 3J : 3 jours × slots de 2h = 36 colonnes */
function buildHourCols(startDay: Date, days: number, todayKey: string): ColDef[] {
  const cols: ColDef[] = [];
  const STEP = 2; // toutes les 2 heures
  for (let d = 0; d < days; d++) {
    const day = addDays(startDay, d);
    const dow = (day.getDay()+6)%7;
    const dk  = toDateKey(day);
    const dayLabel = `${DAY_ABBR[dow]} ${day.getDate()} ${MONTH_ABBR[day.getMonth()]}`;
    for (let h = 0; h < 24; h += STEP) {
      const rStart = new Date(day.getFullYear(),day.getMonth(),day.getDate(),h,0,0,0);
      const rEnd   = new Date(day.getFullYear(),day.getMonth(),day.getDate(),h+STEP-1,59,59,999);
      cols.push({
        key: `${dk}-${h}`,
        line1: `${h}h`,
        line2: "",
        monthHint: "",
        dayGroup: dayLabel,
        rangeStart: rStart,
        rangeEnd: rEnd,
        isCurrentPeriod: dk === todayKey,
      });
    }
  }
  return cols;
}

function buildDayCols(start: Date, count: number, todayKey: string): ColDef[] {
  return Array.from({ length: count }, (_, i) => {
    const day = addDays(start, i);
    const dow = (day.getDay()+6)%7;
    const dk  = toDateKey(day);
    return {
      key: dk, line1: DAY_ABBR[dow], line2: String(day.getDate()),
      monthHint: MONTH_ABBR[day.getMonth()], dayGroup: "",
      rangeStart: day, rangeEnd: endOfDay(day),
      isCurrentPeriod: dk === todayKey,
    };
  });
}

function buildWeekCols(startMonday: Date, count: number, todayKey: string): ColDef[] {
  const todayD = parseLocalDate(todayKey);
  return Array.from({ length: count }, (_, i) => {
    const mon = addDays(startMonday, i*7), sun = addDays(mon,6);
    const ml = mon.getMonth()===sun.getMonth()
      ? MONTH_ABBR[mon.getMonth()]
      : `${MONTH_ABBR[mon.getMonth()]}/${MONTH_ABBR[sun.getMonth()]}`;
    return {
      key: toDateKey(mon), line1: ml, line2: `${mon.getDate()}-${sun.getDate()}`,
      monthHint: "", dayGroup: "",
      rangeStart: mon, rangeEnd: endOfDay(sun),
      isCurrentPeriod: todayD>=mon && todayD<=sun,
    };
  });
}

function buildMonthCols(year: number, startMonth: number, count: number, todayKey: string): ColDef[] {
  const todayD = parseLocalDate(todayKey);
  return Array.from({ length: count }, (_, i) => {
    const mo = (startMonth+i)%12, yr = year+Math.floor((startMonth+i)/12);
    const start = new Date(yr,mo,1), end = new Date(yr,mo+1,0,23,59,59,999);
    return {
      key: `${yr}-${mo}`, line1: MONTH_ABBR[mo], line2: String(yr),
      monthHint: "", dayGroup: "",
      rangeStart: start, rangeEnd: end,
      isCurrentPeriod: todayD>=start && todayD<=end,
    };
  });
}

function getColumns(anchor: Date, scale: Scale, todayKey: string): ColDef[] {
  switch (scale) {
    case "3J": return buildHourCols(anchor, 3, todayKey);
    case "1S": return buildDayCols(getMonday(anchor), 7, todayKey);
    case "2S": return buildDayCols(getMonday(anchor), 14, todayKey);
    case "3S": return buildDayCols(getMonday(anchor), 21, todayKey);
    case "1M": {
      const s = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      return buildDayCols(s, new Date(anchor.getFullYear(),anchor.getMonth()+1,0).getDate(), todayKey);
    }
    case "3M": return buildWeekCols(getMonday(new Date(anchor.getFullYear(),anchor.getMonth(),1)), 13, todayKey);
    case "1A": return buildMonthCols(anchor.getFullYear(), 0, 12, todayKey);
  }
}

function navigateAnchor(anchor: Date, scale: Scale, dir: -1|1): Date {
  const d = new Date(anchor);
  switch (scale) {
    case "3J": d.setDate(d.getDate()+dir*3); break;
    case "1S": d.setDate(d.getDate()+dir*7); break;
    case "2S": d.setDate(d.getDate()+dir*14); break;
    case "3S": d.setDate(d.getDate()+dir*21); break;
    case "1M": d.setMonth(d.getMonth()+dir); break;
    case "3M": d.setMonth(d.getMonth()+dir*3); break;
    case "1A": d.setFullYear(d.getFullYear()+dir); break;
  }
  return d;
}

function getPeriodLabel(anchor: Date, scale: Scale): string {
  const fmt = (d: Date) => `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
  switch (scale) {
    case "3J": return `${fmt(anchor)} – ${fmt(addDays(anchor,2))} ${anchor.getFullYear()}`;
    case "1S": { const mon=getMonday(anchor),sun=addDays(mon,6); return mon.getMonth()===sun.getMonth()?`${MONTH_NAMES[mon.getMonth()]} ${mon.getFullYear()}`:`${MONTH_ABBR[mon.getMonth()]} – ${MONTH_ABBR[sun.getMonth()]} ${sun.getFullYear()}`; }
    case "2S": { const mon=getMonday(anchor),sun=addDays(mon,13); return `${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`; }
    case "3S": { const mon=getMonday(anchor),sun=addDays(mon,20); return `${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`; }
    case "1M": return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
    case "3M": { const e=new Date(anchor.getFullYear(),anchor.getMonth()+2,1); return `${MONTH_ABBR[anchor.getMonth()]} – ${MONTH_ABBR[e.getMonth()]} ${anchor.getFullYear()}`; }
    case "1A": return String(anchor.getFullYear());
  }
}

// ─── Bar positioning ──────────────────────────────────────────────────────────

function getBarIndices(booking: GanttBooking, cols: ColDef[], scale: Scale): { si:number; ei:number } | null {
  const bStart = parseLocalDate(booking.startDate);
  const bEnd   = parseLocalDate(booking.endDate);

  // En mode 3J, on prend en compte les heures exactes de pickup/dropoff
  if (scale === "3J") {
    if (booking.pickupTime) {
      const [h,m] = booking.pickupTime.split(":").map(Number);
      bStart.setHours(h,m,0,0);
    }
    if (booking.dropoffTime) {
      const [h,m] = booking.dropoffTime.split(":").map(Number);
      bEnd.setHours(h,m,59,999);
    } else {
      bEnd.setHours(23,59,59,999);
    }
  } else {
    bEnd.setHours(23,59,59,999);
  }

  if (bEnd < cols[0].rangeStart || bStart > cols[cols.length-1].rangeEnd) return null;
  const si = cols.findIndex(c => c.rangeEnd >= bStart);
  let ei = cols.length;
  for (let i=cols.length-1;i>=0;i--) { if(cols[i].rangeStart<=bEnd){ei=i+1;break;} }
  if (si===-1) return null;
  return { si, ei };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "LOUÉ"|"DISPO"|"MAINT." }) {
  const s: Record<string,string> = {
    "LOUÉ":"border border-orange-600 text-orange-400",
    "DISPO":"border border-emerald-600 text-emerald-400",
    "MAINT.":"border border-amber-700 text-amber-500",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-transparent whitespace-nowrap ${s[status]??s["DISPO"]}`}>{status}</span>;
}

function LegendPill({ color, label }: { color:string; label:string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#2a2a2a] bg-[#111]">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`}/><span className="text-[11px] font-medium text-gray-400">{label}</span>
    </div>
  );
}

interface TooltipData { booking: GanttBooking; x:number; y:number; }

function BookingTooltip({ data }: { data:TooltipData }) {
  const { booking, x, y } = data;
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left:x+14, top:y+14 });
  useEffect(() => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    setPos({ left:x+14+width>window.innerWidth?x-width-14:x+14, top:y+14+height>window.innerHeight?y-height-14:y+14 });
  },[x,y]);
  const name = booking.userName||booking.userEmail?.split("@")[0]||"Client";
  const fmt = (s:string) => parseLocalDate(s).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});
  return (
    <div ref={ref} className="fixed z-[9999] pointer-events-none" style={{left:pos.left,top:pos.top}}>
      <div className="rounded-xl border border-[#2e2e2e] shadow-2xl bg-[#141414]/95 backdrop-blur-md p-4 min-w-[210px]">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-semibold">Détails Réservation</p>
        <p className="text-white font-bold text-base mb-3">{name}</p>
        <div className="space-y-1.5">
          {booking.pickupTime  && <div className="flex justify-between gap-6"><span className="text-gray-400 text-xs">Prise en charge</span><span className="text-gray-100 text-xs font-medium">{booking.pickupTime}</span></div>}
          <div className="flex justify-between gap-6"><span className="text-gray-400 text-xs">Du</span><span className="text-gray-100 text-xs font-medium capitalize">{fmt(booking.startDate)}</span></div>
          <div className="flex justify-between gap-6"><span className="text-gray-400 text-xs">Retour</span><span className="text-gray-100 text-xs font-medium capitalize">{booking.dropoffTime?`${booking.dropoffTime} (${fmt(booking.endDate)})`:fmt(booking.endDate)}</span></div>
          <div className="flex justify-between gap-6 pt-1 border-t border-[#252525] mt-1">
            <span className="text-gray-400 text-xs">Statut</span>
            <span className={`text-xs font-semibold ${booking.status==="confirmed"?"text-emerald-400":booking.status==="pending"?"text-amber-400":booking.status==="cancelled"?"text-red-400":"text-sky-400"}`}>
              {booking.status==="confirmed"?"Confirmée":booking.status==="pending"?"En attente":booking.status==="cancelled"?"Annulée":"Terminée"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const GlobalCalendar = ({ cars, bookings }: GlobalCalendarProps) => {
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [scale,      setScale]      = useState<Scale>("1S");
  const [tooltip,    setTooltip]    = useState<TooltipData | null>(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const todayKey = toDateKey(today);
  const columns  = getColumns(anchorDate, scale, todayKey);
  const colCount = columns.length;
  const isHourScale = scale === "3J";

  const prevPeriod = () => setAnchorDate(navigateAnchor(anchorDate, scale, -1));
  const nextPeriod = () => setAnchorDate(navigateAnchor(anchorDate, scale,  1));
  const goToday    = () => setAnchorDate(new Date());

  const getCarStatus = (car: GanttCar): "LOUÉ"|"DISPO"|"MAINT." => {
    if (car.maintenanceStatus==="maintenance") return "MAINT.";
    const active = bookings.some(b=>b.carId===car.id&&b.status!=="cancelled"&&parseLocalDate(b.startDate)<=today&&parseLocalDate(b.endDate)>=today);
    return active?"LOUÉ":car.isAvailable?"DISPO":"MAINT.";
  };
  const getCarSubtitle = (car: GanttCar) => {
    const p:string[]=[];
    if(car.licensePlate)p.push(car.licensePlate);
    if(car.color)p.push(car.color.toUpperCase());
    else if(car.tag)p.push(car.tag);
    return p.join(" • ");
  };
  const getBarConfig = (status: GanttBooking["status"]) => {
    switch(status){
      case"pending":   return{cls:"opacity-70",style:{background:"rgba(180,83,9,0.12)",border:"1.5px dashed rgba(251,146,60,0.6)",margin:"0 3px"}as React.CSSProperties,dot:"bg-amber-400",text:"text-amber-300",pending:true};
      case"completed": return{cls:"",style:{background:"rgba(12,74,110,0.7)",border:"1px solid #0369a1",margin:"0 3px"}as React.CSSProperties,dot:"bg-sky-400",text:"text-sky-200",pending:false};
      default:         return{cls:"",style:{background:"#7c3f00",border:"1px solid #92400e",margin:"0 3px"}as React.CSSProperties,dot:"bg-orange-400",text:"text-orange-200",pending:false};
    }
  };

  // Groupement des colonnes par jour (pour le header 3J)
  const dayGroups = isHourScale
    ? columns.reduce<{label: string; count: number}[]>((acc, col) => {
        if (!acc.length || acc[acc.length-1].label !== col.dayGroup)
          acc.push({ label: col.dayGroup, count: 1 });
        else acc[acc.length-1].count++;
        return acc;
      }, [])
    : [];

  // Taille de police adaptée au nombre de colonnes
  const colFontSz = colCount > 30 ? "text-[9px]" : colCount > 14 ? "text-[10px]" : "text-xs";

  return (
    <div className="w-full select-none" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-white text-2xl font-bold tracking-tight">{getPeriodLabel(anchorDate,scale)}</h2>
          <div className="flex items-center gap-1 ml-1">
            <button onClick={prevPeriod} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-[#222] border border-[#2a2a2a] transition-colors"><ChevronLeft size={14}/></button>
            <button onClick={goToday}   className="px-3 h-7 text-xs font-semibold rounded-md text-gray-300 hover:text-white hover:bg-[#222] border border-[#2a2a2a] transition-colors uppercase tracking-wider">Aujourd'hui</button>
            <button onClick={nextPeriod} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-[#222] border border-[#2a2a2a] transition-colors"><ChevronRight size={14}/></button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sélecteur d'échelle compact */}
          <div className="flex items-center gap-px p-0.5 rounded-lg bg-[#0d0d0d] border border-[#252525]">
            {SCALES.map(opt => (
              <button
                key={opt.id}
                onClick={() => setScale(opt.id)}
                title={opt.id==="3J"?"3 jours avec heures":opt.id==="1S"?"1 semaine":opt.id==="2S"?"2 semaines":opt.id==="3S"?"3 semaines":opt.id==="1M"?"1 mois":opt.id==="3M"?"3 mois":"1 an"}
                className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all tracking-wider ${scale===opt.id?"bg-orange-600 text-white shadow":"text-gray-500 hover:text-gray-300"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <LegendPill color="bg-orange-500" label="Réservé"/>
          <LegendPill color="bg-amber-600"  label="Maintenance"/>
          <LegendPill color="bg-emerald-500" label="Disponible"/>
        </div>
      </div>

      {/* ── Calendrier ── */}
      <div className="rounded-xl overflow-hidden border border-[#1e1e1e] w-full" style={{background:"#0d0d0d"}}>

        {/* ── Header 3J : 2 lignes (jour + heures) ── */}
        {isHourScale && (
          <>
            {/* Ligne 1 : groupes jours */}
            <div className="flex border-b border-[#1e1e1e]" style={{borderBottomStyle:"solid",borderBottomColor:"#1e1e1e"}}>
              <div className="flex-shrink-0 border-r border-[#1e1e1e]" style={{width:280}}/>
              <div className="flex-1 flex">
                {dayGroups.map((g) => (
                  <div
                    key={g.label}
                    className="border-r border-[#333] last:border-r-0 py-1.5 text-center"
                    style={{flex:g.count}}
                  >
                    <span className="text-[11px] font-bold text-gray-300 tracking-wide uppercase">{g.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Ligne 2 : heures */}
            <div className="flex border-b border-[#1e1e1e]">
              <div className="flex-shrink-0 border-r border-[#1e1e1e] px-4 pb-2 pt-1 text-gray-600 text-[11px] font-bold tracking-widest uppercase flex items-end" style={{width:280}}>Véhicule</div>
              <div className="flex-1 flex overflow-hidden">
                {columns.map(col => (
                  <div key={col.key} className={`flex-1 py-1 min-w-0 border-r border-[#1e1e1e] last:border-r-0 flex items-center justify-center ${col.isCurrentPeriod?"bg-orange-950/20":""}`}>
                    <span className={`text-[9px] font-medium ${col.isCurrentPeriod?"text-orange-400":"text-gray-600"}`}>{col.line1}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Header normal (non-3J) ── */}
        {!isHourScale && (
          <div className="flex border-b border-[#1e1e1e]">
            <div className="flex-shrink-0 border-r border-[#1e1e1e] px-4 pt-3 pb-2 text-gray-600 text-[11px] font-bold tracking-widest uppercase flex items-end" style={{width:280}}>Véhicule</div>
            <div className="flex-1 flex overflow-hidden">
              {columns.map(col => (
                <div key={col.key} className={`flex-1 pt-2 pb-1 min-w-0 border-r border-[#1e1e1e] last:border-r-0 flex flex-col items-center gap-0.5 ${col.isCurrentPeriod?"bg-orange-950/20":""}`}>
                  <span className={`${colFontSz} font-bold tracking-widest uppercase truncate w-full text-center ${col.isCurrentPeriod?"text-orange-400":"text-gray-500"}`}>{col.line1}</span>
                  <span className={`font-bold leading-none ${col.isCurrentPeriod?"text-orange-400":"text-gray-200"} ${colCount>20?"text-[10px]":colCount>10?"text-xs":"text-base"}`}>{col.line2}</span>
                  {col.isCurrentPeriod && col.monthHint && (
                    <span className="text-[9px] font-semibold text-orange-500/80 tracking-widest uppercase leading-none">{col.monthHint}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Lignes véhicules ── */}
        {(!Array.isArray(cars) || cars.length===0) && <div className="py-16 text-center text-gray-600 text-sm">Aucun véhicule à afficher</div>}
        {Array.isArray(cars) && cars.map((car,idx) => {
          const status   = getCarStatus(car);
          const subtitle = getCarSubtitle(car);
          const bookingsList = Array.isArray(bookings) ? bookings : [];
          const carBkgs  = bookingsList.filter(b=>b.carId===car.id&&b.status!=="cancelled");
          const isLast   = idx===cars.length-1;
          return (
            <div key={car.id} className={`flex ${isLast?"":"border-b border-[#1e1e1e]"}`} style={{minHeight:68}}>
              <div className="flex-shrink-0 border-r border-[#1e1e1e] px-4 py-3 flex items-center justify-between gap-2" style={{width:280}}>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">{car.brand} {car.model}</p>
                  {subtitle&&<p className="text-gray-500 text-[11px] mt-0.5 leading-snug truncate">{subtitle}</p>}
                </div>
                <StatusBadge status={status}/>
              </div>
              <div className="flex-1 relative flex overflow-hidden">
                {columns.map(col=>(
                  <div key={col.key} className={`flex-1 min-w-0 border-r border-[#1e1e1e] last:border-r-0 ${col.isCurrentPeriod?"bg-orange-950/10":""}`}/>
                ))}
                {carBkgs.map(booking=>{
                  const idx2=getBarIndices(booking,columns,scale);
                  if(!idx2)return null;
                  const{si,ei}=idx2;
                  const cfg=getBarConfig(booking.status);
                  const label=booking.userName||booking.userEmail?.split("@")[0]||"Client";
                  return(
                    <div
                      key={booking.id}
                      className={`absolute inset-y-0 flex items-center pointer-events-none ${cfg.cls}`}
                      style={{left:`${(si/colCount)*100}%`,width:`${((ei-si)/colCount)*100}%`}}
                    >
                      <button
                        className={`h-10 w-full rounded-md flex items-center justify-center gap-1.5 ${cfg.text} text-[11px] font-semibold tracking-wider cursor-pointer pointer-events-auto transition-opacity hover:opacity-90 overflow-hidden`}
                        style={cfg.style}
                        onMouseEnter={e=>setTooltip({booking,x:e.clientX,y:e.clientY})}
                        onMouseMove={e=>setTooltip(t=>t?{...t,x:e.clientX,y:e.clientY}:null)}
                        onMouseLeave={()=>setTooltip(null)}
                      >
                        {cfg.pending?(
                          <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 animate-pulse"/><span className="truncate uppercase px-1">{label}</span><span className="flex-shrink-0 ml-1 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-[9px] font-bold text-amber-300 tracking-widest hidden sm:inline-flex">ATT.</span></>
                        ):(
                          <><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`}/><span className="truncate uppercase px-1">{label}</span></>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {tooltip&&<BookingTooltip data={tooltip}/>}
    </div>
  );
};

export default GlobalCalendar;
