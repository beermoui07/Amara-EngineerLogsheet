import { useState, useEffect } from "react";

// ─── GOOGLE SHEETS CONFIG ────────────────────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLUgwRlx5U-Uh2GG1RvheJywKahPmmNxG4d453BFcuGwgHwf_7mE4I5wgvBpMBXQhD/exec";

// ─── MONTH UTILITIES ─────────────────────────────────────────────────────────
const THAI_MONTHS = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const ENG_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function sheetName(base: string, dateStr: string) {
  const d = new Date(dateStr);
  return `${base}_${ENG_MONTHS[d.getMonth()]}${d.getFullYear()}`;
}

function thaiMonthLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function today() { return new Date().toISOString().split("T")[0]; }

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SHIFTS  = ["09:30", "21:30", "05:30"];
const CHILLERS = ["CH-01", "CH-02", "CH-03"];

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg:"#0F172A", surface:"#1E293B", card:"#263348",
  accent:"#3B82F6", accentLight:"#60A5FA",
  orange:"#F97316", green:"#22C55E", red:"#EF4444", yellow:"#EAB308",
  text:"#F1F5F9", muted:"#94A3B8", border:"#334155",
  inputBg:"#0F172A", sectionHeader:"#1E40AF",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  app:{ fontFamily:"'Inter','Segoe UI',sans-serif", backgroundColor:C.bg,
        minHeight:"100vh", color:C.text, maxWidth:480, margin:"0 auto", paddingBottom:80 },
  header:{ background:"linear-gradient(135deg,#1E3A8A 0%,#1E40AF 100%)",
           padding:"14px 16px 12px", position:"sticky", top:0, zIndex:100,
           boxShadow:"0 2px 16px rgba(0,0,0,0.4)" },
  logo:{ fontSize:11, fontWeight:800, letterSpacing:"0.3em", color:"#93C5FD", marginBottom:2 },
  pageTitle:{ fontSize:15, fontWeight:700, color:C.text, lineHeight:1.2 },
  dateRow:{ display:"flex", alignItems:"center", gap:8, marginTop:8 },
  dateInput:{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:6,
              padding:"4px 8px", color:C.text, fontSize:13, fontWeight:600, flex:1 },
  monthBadge:{ fontSize:10, color:"#FDE68A", fontWeight:700,
               background:"rgba(253,230,138,0.12)", borderRadius:6, padding:"3px 8px",
               border:"1px solid rgba(253,230,138,0.3)" },
  autoBadge:{ fontSize:9, color:C.orange, fontWeight:700,
              background:"rgba(249,115,22,0.12)", borderRadius:6, padding:"3px 8px",
              border:"1px solid rgba(249,115,22,0.3)" },
  navBar:{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
           width:"100%", maxWidth:480, background:C.surface,
           borderTop:`1px solid ${C.border}`, display:"flex", zIndex:200 },
  navBtn:(a: boolean)=>({ flex:1, padding:"10px 4px 6px", background:"none", border:"none",
                 color: a ? C.accentLight : C.muted, fontSize:9, fontWeight: a ? 700 : 500,
                 cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center",
                 gap:4, borderTop: a ? `2px solid ${C.accent}` : "2px solid transparent",
                 transition:"all 0.15s" }),
  section:{ background:C.card, margin:"10px 12px 0", borderRadius:12,
            overflow:"hidden", border:`1px solid ${C.border}` },
  secHead:{ background:"linear-gradient(90deg,#1E40AF 0%,#1E3A8A 100%)",
            padding:"10px 14px", fontSize:12, fontWeight:700, letterSpacing:"0.05em",
            color:"#BFDBFE", display:"flex", alignItems:"center", gap:8 },
  shiftTabs:{ display:"flex", borderBottom:`1px solid ${C.border}` },
  shiftTab:(a: boolean)=>({ flex:1, padding:"8px 4px", background: a ? C.accent : "transparent",
                   border:"none", color: a ? "#fff" : C.muted,
                   fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }),
  fRow:{ display:"flex", alignItems:"center", padding:"8px 14px",
         borderBottom:`1px solid rgba(51,65,85,0.5)`, gap:10 },
  fLabel:{ flex:1, fontSize:12, color:C.muted, lineHeight:1.3 },
  fRange:{ fontSize:10, color:C.yellow, marginTop:2 },
  fInput:{ width:90, background:C.inputBg, border:`1px solid ${C.border}`,
           borderRadius:8, padding:"7px 10px", color:C.text,
           fontSize:13, fontWeight:600, textAlign:"right", outline:"none", boxSizing:"border-box" },
  fUnit:{ fontSize:11, color:C.muted, width:34 },
  chip:(a: boolean)=>({ padding:"6px 14px", borderRadius:20,
               border:`1px solid ${a ? C.accent : C.border}`,
               background: a ? C.accent : "transparent",
               color: a ? "#fff" : C.muted, fontSize:13, fontWeight:600, cursor:"pointer" }),
  submitBtn:{ margin:"16px 12px", padding:"14px",
              background:"linear-gradient(135deg,#1D4ED8,#2563EB)",
              border:"none", borderRadius:12, color:"#fff", fontSize:15,
              fontWeight:700, cursor:"pointer", width:"calc(100% - 24px)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 14px rgba(37,99,235,0.4)" },
  toast:(t: string)=>({ position:"fixed", top:76, left:"50%", transform:"translateX(-50%)",
                background: t==="success" ? "#166534" : "#7F1D1D",
                color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13,
                fontWeight:600, zIndex:999, boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
                maxWidth:300, textAlign:"center" }),
  toggleBtn:(a: boolean, col: string)=>({ padding:"5px 10px", borderRadius:6,
                         border:`1px solid ${a ? col : C.border}`,
                         background: a ? col+"22" : "transparent",
                         color: a ? col : C.muted, fontSize:11, fontWeight:600, cursor:"pointer" }),
};

// ─── UTILITY HOOKS ───────────────────────────────────────────────────────────
function useFormState(initial: any) {
  const [state, setState] = useState(initial);
  const set = (path: string, value: any) => {
    setState((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };
  // ✅ เติม as const เพื่อให้ TypeScript รู้ว่าเป็น Tuple และไม่เกิด Error ตอนเรียกใช้ฟังก์ชัน
  return [state, set, setState] as const;
}

function useToast() {
  const [toast, setToast] = useState<{type: string, msg: string} | null>(null);
  const show = (type: string, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };
  return [toast, show] as const;
}

// ─── SEND TO SHEETS ───────────────────────────────────────────────────────────
async function sendToSheets(payload: any) {
  await fetch(APPS_SCRIPT_URL, {
    method:"POST", mode:"no-cors",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
  });
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function ShiftTabs({ shift, setShift }: any) {
  const icons: any = { "09:30":"🌅", "21:30":"🌆", "05:30":"🌙" };
  return (
    <div style={S.shiftTabs}>
      {SHIFTS.map(s => (
        <button key={s} style={S.shiftTab(shift===s)} onClick={() => setShift(s)}>
          {icons[s]} {s}
        </button>
      ))}
    </div>
  );
}

function NumInput({ value, onChange, wide, placeholder="—" }: any) {
  return (
    <input type="number" inputMode="decimal"
      style={{ ...S.fInput, width: wide ? 110 : 90 }}
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} />
  );
}

function FieldRow({ label, range, unit, value, onChange, wide }: any) {
  return (
    <div style={S.fRow}>
      <div style={S.fLabel}>
        {label}
        {range && <div style={S.fRange}>Range: {range}</div>}
      </div>
      <NumInput value={value} onChange={onChange} wide={wide} />
      {unit && <span style={S.fUnit}>{unit}</span>}
    </div>
  );
}

function SubmitBtn({ onClick, sending }: any) {
  return (
    <button style={S.submitBtn} onClick={onClick} disabled={sending}>
      {sending ? "⏳ กำลังส่ง..." : "📤 บันทึกข้อมูล"}
    </button>
  );
}

// ─── PAGE 1: CHILLER ─────────────────────────────────────────────────────────
const initChillerRow = () => ({
  compNo:"", opPercent:"", fullLoad:"", dischargeSH:"", oilPressure:"",
  satCondensor:"", satEvaporator:"", dischargeTemp:"", activeSetPoint:"",
  evapEnter:"", evapLeave:"", evapTempDiff:"", evapInlet:"", evapOutlet:"", evapPressDrop:"",
  condEnter:"", condLeave:"", condApproach:"", condTempDiff:"",
  condInlet:"", condOutlet:"", condPressDrop:"",
  elecPower:"", kwMeter:"", pchp:"", cdp:"", cop:"",
});

function ChillerPage({ date }: any) {
  const initData = () => {
    const d: any = {};
    CHILLERS.forEach(ch => { d[ch] = {}; SHIFTS.forEach(s => { d[ch][s] = initChillerRow(); }); });
    return d;
  };
  const [data, setField] = useFormState(initData());
  const [chiller, setChiller] = useState("CH-01");
  const [shift, setShift] = useState("09:30");
  const [sending, setSending] = useState(false);
  const [toast, showToast] = useToast();

  const row = data[chiller][shift];
  const F = (field: string) => ({
    value: row[field],
    onChange: (val: string) => setField(`${chiller}.${shift}.${field}`, val),
  });

  const handleSubmit = async () => {
    setSending(true);
    try {
      await sendToSheets({ sheet: sheetName("Chiller", date), date, chiller, shift, ...row });
      showToast("success", `✅ บันทึก ${chiller} ${shift} สำเร็จ`);
    } catch { showToast("error","❌ ส่งข้อมูลไม่สำเร็จ"); }
    setSending(false);
  };

  return (
    <div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      <div style={S.section}>
        <div style={S.secHead}>🌡️ เครื่อง Chiller</div>
        <div style={{ display:"flex", gap:8, padding:"12px 14px" }}>
          {CHILLERS.map(c => (
            <button key={c} style={S.chip(chiller===c)} onClick={() => setChiller(c)}>{c}</button>
          ))}
        </div>
        <ShiftTabs shift={shift} setShift={setShift} />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>⚙️ Compressor</div>
        <FieldRow label="Comp No." unit="No." {...F("compNo")} />
        <FieldRow label="Operation Percentage" range="5–30" unit="%" {...F("opPercent")} />
        <FieldRow label="Full Load" range="3–10" unit="A" {...F("fullLoad")} />
        <FieldRow label="Discharge Superheat" range="3–40" unit="°F" {...F("dischargeSH")} />
        <FieldRow label="Oil Pressure" unit="kPa" {...F("oilPressure")} />
        <FieldRow label="SAT Condensor Temp." range="14–15" unit="°F" {...F("satCondensor")} />
        <FieldRow label="SAT Evaporator Temp." range="3–10" unit="°F" {...F("satEvaporator")} />
        <FieldRow label="Discharge Temp." range="3–40" unit="°F" {...F("dischargeTemp")} />
        <FieldRow label="Active Set Point" range=">5" unit="°F" {...F("activeSetPoint")} />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>❄️ Evaporator</div>
        <FieldRow label="Entering Temp." range="5–10" unit="°F" {...F("evapEnter")} />
        <FieldRow label="Leaving Temp." range="10.0" unit="°F" {...F("evapLeave")} />
        <FieldRow label="Temp. Diff." unit="°F" {...F("evapTempDiff")} />
        <FieldRow label="Inlet Pressure" unit="Psi" {...F("evapInlet")} />
        <FieldRow label="Outlet Pressure" unit="Psi" {...F("evapOutlet")} />
        <FieldRow label="Pressure Drop" unit="Psi" {...F("evapPressDrop")} />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🔥 Condensor</div>
        <FieldRow label="Entering Temp." range="25–30" unit="°F" {...F("condEnter")} />
        <FieldRow label="Leaving Temp." range="30–40" unit="°F" {...F("condLeave")} />
        <FieldRow label="Approach Temp." range=">5.5" unit="°F" {...F("condApproach")} />
        <FieldRow label="Temp. Diff." unit="°F" {...F("condTempDiff")} />
        <FieldRow label="Inlet Pressure" unit="Psi" {...F("condInlet")} />
        <FieldRow label="Outlet Pressure" unit="Psi" {...F("condOutlet")} />
        <FieldRow label="Pressure Drop" unit="Psi" {...F("condPressDrop")} />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>⚡ Power & Performance</div>
        <FieldRow label="Electric Power Meter" unit="kW" wide {...F("elecPower")} />
        <FieldRow label="Kilowatt Meter" unit="kW" wide {...F("kwMeter")} />
        <FieldRow label="PCHP (Flow Rate)" {...F("pchp")} />
        <FieldRow label="CDP (Flow Rate)" {...F("cdp")} />
        <FieldRow label="COP (Co-efficiency)" {...F("cop")} />
      </div>

      <SubmitBtn onClick={handleSubmit} sending={sending} />
    </div>
  );
}

// ─── PAGE 2: PUMP & COOLING TOWER ────────────────────────────────────────────
const PUMP_EQUIP = [
  { key:"condensorPump", label:"Condensor Pump" },
  { key:"coolingTower",  label:"Cooling Tower" },
  { key:"chilledPCHP",   label:"Chilled Pump (PCHP)" },
  { key:"chilledSCHP",   label:"Chilled Pump (SCHP)" },
];

function PumpPage({ date }: any) {
  const initPumps = () => {
    const d: any = {};
    PUMP_EQUIP.forEach(({ key }) => {
      d[key] = {};
      SHIFTS.forEach(s => { d[key][s] = { in1:"",in2:"",in3:"",out1:"",out2:"",out3:"" }; });
    });
    return d;
  };
  const initData = () => ({
    pumps: initPumps(),
    freezer:  { "09:30":{f1:"",f2:""}, "21:30":{f1:"",f2:""}, "05:30":{f1:"",f2:""} } as any,
    wine:     { "09:30":{w1:"",w2:""}, "21:30":{w1:"",w2:""}, "05:30":{w1:"",w2:""} } as any,
    heatWater:{ "09:30":"", "21:30":"", "05:30":"" } as any,
    conductivity:"", caChemical:"", acChemical:"", waterSoftener:"",
    gasInlet:"", gasOutlet:"",
    mainMeter:"", coolingMeter:"", bleedOff:"", swimPool:"",
    mainKitchenGas:"", showKitchenGas:"", banquetKitchenGas:"",
  });

  const [data, setField] = useFormState(initData());
  const [shift, setShift] = useState("09:30");
  const [sending, setSending] = useState(false);
  const [toast, showToast] = useToast();

  const handleSubmit = async () => {
    setSending(true);
    try {
      await sendToSheets({ sheet: sheetName("PumpCooling", date), date, shift, ...data });
      showToast("success","✅ บันทึก Pump & Cooling Tower สำเร็จ");
    } catch { showToast("error","❌ ส่งข้อมูลไม่สำเร็จ"); }
    setSending(false);
  };

  const PressureBlock = ({ equipKey, label }: any) => (
    <div style={{ borderBottom:`1px solid ${C.border}` }}>
      <div style={{ padding:"8px 14px 4px", fontSize:11, color:C.accentLight, fontWeight:700 }}>{label}</div>
      <div style={{ display:"flex", gap:6, padding:"4px 14px 10px", flexWrap:"wrap" }}>
        {[["in1","in2","in3"],["out1","out2","out3"]].map((fields, gi) =>
          fields.map((f, i) => (
            <div key={f} style={{ flex:1, minWidth:56 }}>
              <div style={{ fontSize:9, color:C.muted, marginBottom:3 }}>{gi===0?"IN":"OUT"} {i+1}</div>
              <input type="number" inputMode="decimal"
                style={{ ...S.fInput, width:"100%", textAlign:"center" }}
                value={data.pumps[equipKey][shift][f]}
                onChange={e => setField(`pumps.${equipKey}.${shift}.${f}`, e.target.value)}
                placeholder="—" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  const SimpleField = ({ path, label, unit }: any) => {
    const keys = path.split(".");
    let val: any = data;
    keys.forEach(k => { val = val?.[k]; });
    return (
      <div style={S.fRow}>
        <div style={S.fLabel}>{label}</div>
        <NumInput value={val || ""} onChange={(v: string) => setField(path, v)} />
        {unit && <span style={S.fUnit}>{unit}</span>}
      </div>
    );
  };

  return (
    <div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      <div style={S.section}>
        <div style={S.secHead}>💧 Pump Inlet / Outlet Pressure</div>
        <ShiftTabs shift={shift} setShift={setShift} />
        {PUMP_EQUIP.map(({ key, label }) => (
          <PressureBlock key={key} equipKey={key} label={label} />
        ))}
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🧊 Freezer Temperature</div>
        <div style={S.fRow}>
          <div style={S.fLabel}>No.01 (-18 to -22°C)</div>
          <NumInput value={data.freezer[shift].f1} onChange={(v: string) => setField(`freezer.${shift}.f1`,v)} />
          <span style={S.fUnit}>°C</span>
        </div>
        <div style={S.fRow}>
          <div style={S.fLabel}>No.02 (2 to 5°C)</div>
          <NumInput value={data.freezer[shift].f2} onChange={(v: string) => setField(`freezer.${shift}.f2`,v)} />
          <span style={S.fUnit}>°C</span>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🍷 Wine Cabinet</div>
        <div style={S.fRow}>
          <div style={S.fLabel}>No.01 (9 to 10°C)</div>
          <NumInput value={data.wine[shift].w1} onChange={(v: string) => setField(`wine.${shift}.w1`,v)} />
          <span style={S.fUnit}>°C</span>
        </div>
        <div style={S.fRow}>
          <div style={S.fLabel}>No.02 (18 to 20°C)</div>
          <NumInput value={data.wine[shift].w2} onChange={(v: string) => setField(`wine.${shift}.w2`,v)} />
          <span style={S.fUnit}>°C</span>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.secHead}>♨️ Heat Water</div>
        <div style={S.fRow}>
          <div style={S.fLabel}>อุณหภูมิน้ำร้อน</div>
          <NumInput value={data.heatWater[shift]} onChange={(v: string) => setField(`heatWater.${shift}`,v)} />
          <span style={S.fUnit}>°C</span>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🔬 Water Quality & Gas</div>
        <SimpleField path="conductivity" label="Conductivity Cooling Tower" unit="PPM" />
        <SimpleField path="caChemical"   label="CA Chemical (ถัง)" unit="L" />
        <SimpleField path="acChemical"   label="AC Chemical (ถัง)" unit="L" />
        <SimpleField path="waterSoftener" label="Water Softener" unit="PPM" />
        <SimpleField path="gasInlet"  label="Gas Inlet Pressure"  unit="PSIG" />
        <SimpleField path="gasOutlet" label="Gas Outlet Pressure" unit="PSIG" />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>💧 Water Meter</div>
        <SimpleField path="mainMeter"    label="Main"          unit="m³" />
        <SimpleField path="coolingMeter" label="Cooling Tower" unit="m³" />
        <SimpleField path="bleedOff"     label="Bleed-Off"     unit="m³" />
        <SimpleField path="swimPool"     label="Swimming Pool" unit="m³" />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🔥 Gas Meter</div>
        <SimpleField path="mainKitchenGas"    label="Main Kitchen" />
        <SimpleField path="showKitchenGas"    label="Show Kitchen" />
        <SimpleField path="banquetKitchenGas" label="Banquet Kitchen" />
      </div>

      <SubmitBtn onClick={handleSubmit} sending={sending} />
    </div>
  );
}

// ─── PAGE 3: MDB ─────────────────────────────────────────────────────────────
const BOARDS = ["MDB1","MDB2","EMDB"];
const CODE_UNITS: any = {
  "1":"Pate","2":"t","10":"mwh","11":"mwh","12":"mwh",
  "20":"mwh","21":"mwh","22":"mwh","31":"mw","32":"mw",
  "41":"kw","42":"kw","60":"mw mvn","61":"mw mvn",
  "71":"mwa","72":"mwa","81":"mvar","82":"mvar",
};

function MDBPage({ date }: any) {
  const initRow = () => ({ r:"",s:"",t:"",ampR:"",ampS:"",ampT:"", ats:"Auto", kwh:"" });
  const initData = () => {
    const d: any = {};
    BOARDS.forEach(b => { d[b] = {}; SHIFTS.forEach(s => { d[b][s] = initRow(); }); });
    const codes: any = {};
    Object.keys(CODE_UNITS).forEach(c => { codes[c] = ""; });
    return { boards:d, codes, remark:"" };
  };

  const [data, setField] = useFormState(initData());
  const [board, setBoard] = useState("MDB1");
  const [shift, setShift] = useState("09:30");
  const [sending, setSending] = useState(false);
  const [toast, showToast] = useToast();

  const row = data.boards[board][shift];

  const handleSubmit = async () => {
    setSending(true);
    try {
      await sendToSheets({ sheet: sheetName("MDB", date), date, shift, board, ...data });
      showToast("success","✅ บันทึก MDB สำเร็จ");
    } catch { showToast("error","❌ ส่งข้อมูลไม่สำเร็จ"); }
    setSending(false);
  };

  return (
    <div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      <div style={S.section}>
        <div style={S.secHead}>⚡ Main Distribution Boards</div>
        <div style={{ display:"flex", gap:8, padding:"10px 14px" }}>
          {BOARDS.map(b => (
            <button key={b} style={S.chip(board===b)} onClick={() => setBoard(b)}>{b}</button>
          ))}
        </div>
        <ShiftTabs shift={shift} setShift={setShift} />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>📊 Voltage (V) & Amps (A)</div>
        {[["Voltage R","r","V"],["Voltage S","s","V"],["Voltage T","t","V"],
          ["Amps R","ampR","A"],["Amps S","ampS","A"],["Amps T","ampT","A"]].map(([label,field,unit]) => (
          <div key={field} style={S.fRow}>
            <div style={S.fLabel}>{label}</div>
            <NumInput value={row[field]}
              onChange={(v: string) => setField(`boards.${board}.${shift}.${field}`, v)} />
            <span style={S.fUnit}>{unit}</span>
          </div>
        ))}
        <div style={{ ...S.fRow, gap:6 }}>
          <div style={{ ...S.fLabel, flex:"none" }}>ATS Status:</div>
          {["Auto","Normal","Off"].map(opt => (
            <button key={opt}
              style={S.toggleBtn(row.ats===opt, opt==="Auto" ? C.green : opt==="Normal" ? C.accent : C.red)}
              onClick={() => setField(`boards.${board}.${shift}.ats`, opt)}>{opt}</button>
          ))}
        </div>
        <div style={S.fRow}>
          <div style={S.fLabel}>kWh Meter</div>
          <NumInput value={row.kwh} onChange={(v: string) => setField(`boards.${board}.${shift}.kwh`, v)} />
          <span style={S.fUnit}>kWh</span>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🔢 Electricity Main Meter Codes</div>
        {Object.entries(CODE_UNITS).map(([code, unit]: any) => (
          <div key={code} style={S.fRow}>
            <div style={S.fLabel}>Code {code}</div>
            <NumInput value={(data.codes as any)[code]}
              onChange={(v: string) => setField(`codes.${code}`, v)} />
            <span style={S.fUnit}>{unit}</span>
          </div>
        ))}
      </div>

      <div style={{ ...S.section, padding:14 }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>📝 Remark</div>
        <textarea
          style={{ width:"100%", background:C.inputBg, border:`1px solid ${C.border}`,
                   borderRadius:8, padding:10, color:C.text, fontSize:13, resize:"vertical",
                   minHeight:80, boxSizing:"border-box", outline:"none" }}
          value={data.remark}
          onChange={e => setField("remark", e.target.value)}
          placeholder="บันทึกเพิ่มเติม..." />
      </div>

      <SubmitBtn onClick={handleSubmit} sending={sending} />
    </div>
  );
}

// ─── PAGE 4: PUMP ROOM ────────────────────────────────────────────────────────
const PUMP_ROOM_LIST = [
  { key:"firePump",  label:"🔴 Fire Pump" },
  { key:"jocKey",   label:"Jockey Pump" },
  { key:"cwtp1",    label:"CWTP No.01" },
  { key:"cwtp2",    label:"CWTP No.02" },
  { key:"cwtp3",    label:"CWTP No.03" },
  { key:"dp1",      label:"DP No.01" },
  { key:"dp2",      label:"DP No.02" },
  { key:"dp3",      label:"DP No.03" },
  { key:"dp4",      label:"DP No.04" },
  { key:"pumpF1",   label:"Pump/F1 No.01" },
  { key:"pumpF2",   label:"Pump/F2 No.02" },
  { key:"swp1",     label:"SWP No.01" },
  { key:"swp2",     label:"SWP No.02" },
  { key:"cwbp1",    label:"CWBP No.01" },
  { key:"cwbp2",    label:"CWBP No.02" },
  { key:"cwbp3",    label:"CWBP No.03" },
  { key:"hwrp1",    label:"B2/HWRP No.01" },
  { key:"hwrp2",    label:"B2/HWRP No.02" },
];

function PumpRoomPage({ date }: any) {
  const initData = () => {
    const d: any = {};
    SHIFTS.forEach(s => {
      d[s] = {};
      PUMP_ROOM_LIST.forEach(({ key }) => { d[s][key] = { status:"Auto", inletPsi:"" }; });
    });
    return d;
  };

  const [data, setField] = useFormState(initData());
  const [shift, setShift] = useState("09:30");
  const [sending, setSending] = useState(false);
  const [toast, showToast] = useToast();

  const handleSubmit = async () => {
    setSending(true);
    try {
      await sendToSheets({ sheet: sheetName("PumpRoom", date), date, shift, pumps: data[shift] });
      showToast("success","✅ บันทึก Pump Room สำเร็จ");
    } catch { showToast("error","❌ ส่งข้อมูลไม่สำเร็จ"); }
    setSending(false);
  };

  return (
    <div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}

      <div style={S.section}>
        <div style={S.secHead}>🔧 Property Pump Room</div>
        <ShiftTabs shift={shift} setShift={setShift} />
      </div>

      <div style={S.section}>
        <div style={S.secHead}>🔧 Status & Pressure</div>
        {PUMP_ROOM_LIST.map(({ key, label }) => {
          const row = data[shift][key];
          return (
            <div key={key} style={{ borderBottom:`1px solid rgba(51,65,85,0.5)`, padding:"8px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ fontSize:12, fontWeight:600 }}>{label}</div>
                <div style={{ display:"flex", gap:4 }}>
                  {["Auto","Manual","Off"].map(opt => (
                    <button key={opt}
                      style={S.toggleBtn(row.status===opt, opt==="Auto"?C.green:opt==="Manual"?C.yellow:C.red)}
                      onClick={() => setField(`${shift}.${key}.status`, opt)}>{opt}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:11, color:C.muted, flex:1 }}>Inlet Pressure</div>
                <NumInput value={row.inletPsi}
                  onChange={(v: string) => setField(`${shift}.${key}.inletPsi`, v)} />
                <span style={S.fUnit}>Psi</span>
              </div>
            </div>
          );
        })}
      </div>

      <SubmitBtn onClick={handleSubmit} sending={sending} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]  = useState("chiller");
  const [date, setDate]  = useState(today());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = today();
      setDate(prev => prev !== now ? now : prev);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const NAV = [
    { key:"chiller",  icon:"🌡️", label:"Chiller" },
    { key:"pump",     icon:"💧", label:"Pump/CT" },
    { key:"mdb",      icon:"⚡", label:"MDB" },
    { key:"pumproom", icon:"🔧", label:"Pump Room" },
  ];

  const TITLES: any = {
    chiller:"Chiller Daily Log", pump:"Pump & Cooling Tower",
    mdb:"Main Distribution Boards", pumproom:"Pump Room Operation",
  };

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>A M A R A  B A N G K O K</div>
        <div style={S.pageTitle}>{TITLES[page]}</div>

        {/* Date picker */}
        <div style={S.dateRow}>
          <span>📅</span>
          <input type="date" style={S.dateInput} value={date}
            onChange={e => setDate(e.target.value)} />
          <span style={{ fontSize:10, color:"#93C5FD", fontWeight:700,
                         background:"rgba(147,197,253,0.12)", borderRadius:6,
                         padding:"3px 8px", border:"1px solid rgba(147,197,253,0.3)" }}>
            ENG25-LS
          </span>
        </div>

        {/* Month indicator */}
        <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
          <span>📂</span>
          <span style={{ color:"#93C5FD" }}>Sheet: </span>
          <span style={{ color:"#FDE68A", fontWeight:700 }}>{thaiMonthLabel(date)}</span>
          <span style={{ marginLeft:"auto", fontSize:9, color:C.orange, fontWeight:700,
                         background:"rgba(249,115,22,0.12)", borderRadius:6,
                         padding:"2px 7px", border:"1px solid rgba(249,115,22,0.3)" }}>
            🔄 เปลี่ยนอัตโนมัติ
          </span>
        </div>
      </div>

      {/* Pages */}
      {page === "chiller"  && <ChillerPage  date={date} />}
      {page === "pump"     && <PumpPage     date={date} />}
      {page === "mdb"      && <MDBPage      date={date} />}
      {page === "pumproom" && <PumpRoomPage date={date} />}

      {/* Bottom Nav */}
      <nav style={S.navBar}>
        {NAV.map(({ key, icon, label }) => (
          <button key={key} style={S.navBtn(page===key)} onClick={() => setPage(key)}>
            <span style={{ fontSize:20 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
