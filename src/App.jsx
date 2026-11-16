import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowUpRight, Bell, BookOpen, CalendarDays, CheckCircle2,
  ChevronDown, ClipboardCheck, Download, FileWarning, Flame, Gauge, HardHat, Leaf,
  Menu, Plus, Search, ShieldCheck, Siren, Target, TrendingUp, Users, Wrench
} from 'lucide-react';

const initial = {
  period: 'July 2025',
  kpis: { daysWithoutLti: 38, lti: 1, wld: 28, nearMiss: 5, firstAid: 0, propertyDamage: 0, totalManhours: 97000 },
  manhours: [
    {month:'Jan',direct:31,indirect:76},{month:'Feb',direct:34,indirect:85},
    {month:'Mar',direct:26,indirect:84},{month:'Apr',direct:27,indirect:84},
    {month:'May',direct:27,indirect:84},{month:'Jun',direct:87,indirect:103},
    {month:'Jul',direct:68,indirect:29}
  ],
  monthly: [
    {month:'Jan',fr:0,sr:0},{month:'Feb',fr:0,sr:0},{month:'Mar',fr:0,sr:0},
    {month:'Apr',fr:0,sr:0},{month:'May',fr:0,sr:0},{month:'Jun',fr:0,sr:0},
    {month:'Jul',fr:1,sr:25}
  ],
  safetyMoments: [{name:'June',value:207},{name:'July',value:345},{name:'May',value:309},{name:'April',value:138},{name:'March',value:204},{name:'February',value:182}],
  inspections: [{name:'Passed',value:30},{name:'Open findings',value:22},{name:'Overdue',value:14},{name:'Closed',value:32},{name:'Pending',value:12},{name:'Critical',value:9},{name:'Other',value:25}],
  inductions: [{name:'Completed',value:57},{name:'Scheduled',value:24},{name:'Contractors',value:16},{name:'Visitors',value:8},{name:'Refresher',value:9},{name:'Other',value:15}],
  ptw: [{name:'Confined space',value:42.86},{name:'Hot work',value:32.86},{name:'Work at height',value:14.2},{name:'Lifting',value:8.65},{name:'Electrical',value:1.43}],
  walks: {done:27,target:52}, salama:{closed:46,total:86}, observations:{closed:62,total:102},
  injury: [{name:'Muscle pain',value:0},{name:'Injury',value:0},{name:'Fracture',value:1},{name:'Cut',value:0},{name:'Burn',value:0}],
  actions: [
    {id:1,title:'Install missing conveyor guarding',area:'Raw Mill • Line 2',owner:'Maintenance',due:'2025-08-05',priority:'High',status:'Open'},
    {id:2,title:'Repair damaged handrail at clinker silo',area:'Clinker • Line 2',owner:'Civil Works',due:'2025-08-08',priority:'Medium',status:'In progress'},
    {id:3,title:'Inspect lifting accessories and update register',area:'Workshop',owner:'HSE',due:'2025-08-12',priority:'High',status:'Open'}
  ],
  incidents: [
    {id:1,date:'2025-07-14',type:'LTI',area:'Production',severity:'High',status:'Investigation'},
    {id:2,date:'2025-07-19',type:'Near Miss',area:'Raw Mill',severity:'Medium',status:'Closed'}
  ],
  training: {talks:1770,targetTalks:2900,walks:26,targetWalks:60,inductionSessions:52,participants:387,safetyMinutes:120,tbtParticipants:1172}
};
const COLORS = ['#ffbd19','#f36b4a','#2386f4','#7555c7','#0b9b83','#a9b5c6','#e34f91'];
const fmt = n => new Intl.NumberFormat('en-US').format(Number(n||0));
const pct = (a,b) => b ? Math.round(a/b*100) : 0;
function readData(){ try { const v=localStorage.getItem('scg-safety-360'); return v?{...initial,...JSON.parse(v)}:initial; } catch { return initial; } }
function Kpi({label,value,sub,icon:Icon,tone='blue'}) {
 return <div className="kpi-card"><div className="kpi-top"><span>{label}</span><span className={'kpi-icon '+tone}><Icon size={17}/></span></div><div className="kpi-value">{fmt(value)}</div><div className="kpi-sub">{sub}</div></div>;
}
function Panel({title,tag,children,extra}){return <section className="panel"><div className="panel-head"><div><h3>{title}</h3>{tag&&<span>{tag}</span>}</div>{extra}</div>{children}</section>}
function Donut({data}){return <div className="donut-wrap"><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={2}>{data.map((d,i)=><Cell key={d.name} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>fmt(v)}/></PieChart></ResponsiveContainer><div className="legend">{data.slice(0,6).map((d,i)=><span key={d.name}><i style={{background:COLORS[i%COLORS.length]}}/>{d.name}</span>)}</div></div>}
function GaugeCard({title,value,total,label}){const percent=Math.min(100,pct(value,total));return <div className="gauge-card"><div className="gauge-title">{title}</div><div className="gauge"><div className="gauge-track"/><div className="gauge-fill" style={{'--value':percent+'%'}}/><strong>{fmt(value)}</strong></div><div className="gauge-foot"><span>{label}</span><b>{percent}%</b><span>Target {fmt(total)}</span></div></div>}
export default function App(){
 const [data,setData]=useState(readData);
 const [page,setPage]=useState('Overview');
 const [period,setPeriod]=useState(data.period);
 const [query,setQuery]=useState('');
 const [showForm,setShowForm]=useState(false);
 const [form,setForm]=useState({title:'',area:'',owner:'HSE',due:'',priority:'Medium',status:'Open'});
 const [mobile,setMobile]=useState(false);
 const [toast,setToast]=useState('');
 const save = next => {setData(next);localStorage.setItem('scg-safety-360',JSON.stringify(next));};
 const notify = msg => {setToast(msg);setTimeout(()=>setToast(''),2500);};
 const filteredActions=useMemo(()=>data.actions.filter(a=>(a.title+' '+a.area+' '+a.owner).toLowerCase().includes(query.toLowerCase())),[data.actions,query]);
 const nav=[['Overview',Gauge],['Incidents',AlertTriangle],['Actions',ClipboardCheck],['Prevention',ShieldCheck],['Workforce',Users],['Industrial Safety',Wrench],['Environment',Leaf],['Emergency',Siren]];
 const addAction=e=>{e.preventDefault();if(!form.title.trim())return;save({...data,actions:[{...form,id:Date.now()},...data.actions]});setForm({title:'',area:'',owner:'HSE',due:'',priority:'Medium',status:'Open'});setShowForm(false);notify('Corrective action added');};
 const exportCsv=()=>{const rows=[['ID','Action','Area','Owner','Due date','Priority','Status'],...data.actions.map(a=>[a.id,a.title,a.area,a.owner,a.due,a.priority,a.status])];const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='SCG_HSE_actions.csv';a.click();URL.revokeObjectURL(url);};
 const updateStatus=(id,status)=>save({...data,actions:data.actions.map(a=>a.id===id?{...a,status}:a)});
 const reset=()=>{if(confirm('Reset dashboard to the original demonstration dataset?')){save(initial);notify('Demo data restored');}};
 const editKpi=(key,label)=>{const v=prompt('Enter new value for '+label,data.kpis[key]);if(v!==null&&v.trim()!==''&&!Number.isNaN(Number(v)))save({...data,kpis:{...data.kpis,[key]:Number(v)}});};
 return <div className="app-shell">
  <aside className={'sidebar '+(mobile?'open':'')}><div className="brand"><div className="brand-mark">S<span>+</span></div><div><b>SCG</b><small>SAFETY 360</small></div><button className="close-nav" onClick={()=>setMobile(false)}>×</button></div>
   <div className="site-label">HEALTH · SAFETY · ENVIRONMENT</div><div className="nav-label">WORKSPACE</div>
   {nav.map(([n,I])=><button key={n} className={'nav-item '+(page===n?'active':'')} onClick={()=>{setPage(n);setMobile(false)}}><I size={18}/><span>{n}</span>{n==='Actions'&&<em>{data.actions.filter(a=>a.status!=='Closed').length}</em>}</button>)}
   <div className="sidebar-bottom"><div className="plant-card"><div className="plant-icon"><HardHat size={20}/></div><div><b>Gabès Cement Plant</b><small>SCG · Tunisia</small></div></div><div className="user-row"><div className="avatar">HS</div><div><b>HSE Workspace</b><small>Administrator</small></div><ChevronDown size={15}/></div></div>
  </aside>
  <main className="main"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(!mobile)}><Menu/></button><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><div className="period-select"><CalendarDays size={16}/><select value={period} onChange={e=>{setPeriod(e.target.value);save({...data,period:e.target.value})}}><option>July 2025</option><option>June 2025</option><option>2026 YTD</option><option>Custom period</option></select></div><button className="icon-btn" title="Notifications"><Bell size={18}/><i/></button><div className="avatar">HS</div></div></header>
   <div className="content"><div className="welcome-row"><div><div className="eyebrow">SCG · HSE PERFORMANCE INTELLIGENCE</div><h1>{page==='Overview'?'Safety Performance':page}</h1><p>Monitor risk, strengthen prevention and drive operational safety.</p></div><div className="welcome-actions"><button className="btn secondary" onClick={exportCsv}><Download size={16}/> Export actions</button><button className="btn primary" onClick={()=>{setPage('Actions');setShowForm(true)}}><Plus size={17}/> Add action</button></div></div>
   {page==='Overview'&&<>
    <div className="section-caption"><span>SAFETY AT A GLANCE</span><span className="live-dot"/> <small>Demo dataset · edit KPI values</small></div>
    <div className="kpi-grid">
     <div onClick={()=>editKpi('daysWithoutLti','Days without LTI')}><Kpi label="Days without LTI" value={data.kpis.daysWithoutLti} sub="Current streak · editable" icon={ShieldCheck} tone="green"/></div>
     <div onClick={()=>editKpi('lti','LTI')}><Kpi label="Lost Time Injuries" value={data.kpis.lti} sub="Year to date" icon={AlertTriangle} tone="red"/></div>
     <div onClick={()=>editKpi('wld','WLD')}><Kpi label="WLD" value={data.kpis.wld} sub="Work-related days lost" icon={Activity} tone="orange"/></div>
     <div onClick={()=>editKpi('nearMiss','Near Miss')}><Kpi label="Near Miss" value={data.kpis.nearMiss} sub="Reported events" icon={FileWarning} tone="purple"/></div>
     <div onClick={()=>editKpi('firstAid','First Aid')}><Kpi label="First Aid" value={data.kpis.firstAid} sub="Cases recorded" icon={Users} tone="blue"/></div>
     <div onClick={()=>editKpi('propertyDamage','Property damage')}><Kpi label="Property damage" value={data.kpis.propertyDamage} sub="Events recorded" icon={Wrench} tone="slate"/></div>
    </div>
    <div className="grid-main"><Panel title="Man-hours · Direct vs indirect" tag="Thousands of hours"><div className="chart-legend"><span><i className="yellow-dot"/> Direct</span><span><i className="navy-dot"/> Indirect</span></div><ResponsiveContainer width="100%" height={250}><BarChart data={data.manhours} barGap={5}><CartesianGrid strokeDasharray="3 4" vertical={false}/><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="direct" name="Direct (k)" fill="#ffbd19" radius={[5,5,0,0]}/><Bar dataKey="indirect" name="Indirect (k)" fill="#183858" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></Panel>
     <Panel title="Frequency & severity trends" tag="Monthly performance"><div className="chart-legend"><span><i className="blue-dot"/> Frequency rate</span><span><i className="orange-dot"/> Severity rate</span></div><ResponsiveContainer width="100%" height={250}><LineChart data={data.monthly}><CartesianGrid strokeDasharray="3 4" vertical={false}/><XAxis dataKey="month"/><YAxis/><Tooltip/><Line type="monotone" dataKey="fr" name="Frequency rate" stroke="#2587f7" strokeWidth={3} dot={{r:3}}/><Line type="monotone" dataKey="sr" name="Severity rate" stroke="#f36b4a" strokeWidth={3} dot={{r:3}}/></LineChart></ResponsiveContainer></Panel>
    </div>
    <div className="section-caption space-top"><span>PREVENTION & ENGAGEMENT</span><small>Leading indicators</small></div>
    <div className="grid-three"><Panel title="Safety moments" tag="By month"><Donut data={data.safetyMoments}/></Panel><Panel title="Equipment inspections" tag="Inspection status"><Donut data={data.inspections}/></Panel><Panel title="Safety induction" tag="Attendance mix"><Donut data={data.inductions}/></Panel></div>
    <div className="grid-main lower"><Panel title="Permit to work distribution" tag="PTW by risk category"><div className="ptw-layout"><div className="ptw-chart"><ResponsiveContainer width="100%" height={225}><PieChart><Pie data={data.ptw} dataKey="value" nameKey="name" outerRadius={88} paddingAngle={2}>{data.ptw.map((d,i)=><Cell key={d.name} fill={COLORS[i]}/>)}</Pie><Tooltip formatter={v=>v+'%'}/></PieChart></ResponsiveContainer></div><div className="ptw-list">{data.ptw.map((p,i)=><div key={p.name}><i style={{background:COLORS[i]}}/><span>{p.name}</span><b>{p.value}%</b></div>)}</div></div></Panel><Panel title="Safety performance targets" tag="Progress to annual target"><div className="gauges"><GaugeCard title="Safety walks" value={data.walks.done} total={data.walks.target} label="Completed"/><GaugeCard title="SALAMA cards" value={data.salama.closed} total={data.salama.total} label="Resolved"/><GaugeCard title="Observations" value={data.observations.closed} total={data.observations.total} label="Closed"/></div></Panel></div>
    <div className="grid-main lower"><Panel title="Corrective actions" tag="Latest open actions" extra={<button className="text-btn" onClick={()=>setPage('Actions')}>View all <ArrowUpRight size={14}/></button>}><div className="action-list">{data.actions.slice(0,4).map(a=><div className="action-row" key={a.id}><div className="action-symbol"><ClipboardCheck size={17}/></div><div className="action-info"><b>{a.title}</b><small>{a.area} · {a.owner}</small></div><span className={'status '+a.status.toLowerCase().replace(' ','-')}>{a.status}</span></div>)}</div></Panel><Panel title="Incident snapshot" tag="Recent event log" extra={<button className="text-btn" onClick={()=>setPage('Incidents')}>View all <ArrowUpRight size={14}/></button>}><div className="incident-list">{data.incidents.map(i=><div className="incident-row" key={i.id}><div className="incident-date">{i.date.slice(5)}</div><div><b>{i.type}</b><small>{i.area} · {i.severity} severity</small></div><span className="status">{i.status}</span></div>)}</div></Panel></div>
   </>}
   {page==='Actions'&&<Panel title="Corrective & preventive action register" tag={data.actions.length+' records'} extra={<button className="btn primary small" onClick={()=>setShowForm(!showForm)}><Plus size={15}/> New action</button>}>
    {showForm&&<form className="action-form" onSubmit={addAction}><input required placeholder="Action description" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input placeholder="Area / department" value={form.area} onChange={e=>setForm({...form,area:e.target.value})}/><input placeholder="Responsible" value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/><input type="date" value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select><button className="btn primary" type="submit">Save action</button></form>}
    <div className="table-tools"><div className="searchbox"><Search size={16}/><input placeholder="Search actions, areas, owners..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="btn secondary" onClick={exportCsv}><Download size={15}/> CSV</button></div>
    <div className="table-wrap"><table><thead><tr><th>Action</th><th>Area</th><th>Owner</th><th>Due date</th><th>Priority</th><th>Status</th></tr></thead><tbody>{filteredActions.map(a=><tr key={a.id}><td><b>{a.title}</b></td><td>{a.area}</td><td>{a.owner}</td><td>{a.due||'—'}</td><td><span className={'priority '+a.priority.toLowerCase()}>{a.priority}</span></td><td><select className="status-select" value={a.status} onChange={e=>updateStatus(a.id,e.target.value)}><option>Open</option><option>In progress</option><option>Closed</option></select></td></tr>)}</tbody></table></div>
   </Panel>}
   {page==='Incidents'&&<><div className="kpi-grid"><Kpi label="LTI" value={data.kpis.lti} sub="Lost time injuries" icon={AlertTriangle} tone="red"/><Kpi label="Near Miss" value={data.kpis.nearMiss} sub="Reported" icon={FileWarning} tone="purple"/><Kpi label="First Aid" value={data.kpis.firstAid} sub="Recorded" icon={Users}/><Kpi label="WLD" value={data.kpis.wld} sub="Days lost" icon={Activity} tone="orange"/></div><Panel title="Incident register" tag={data.incidents.length+' records'}><div className="table-wrap"><table><thead><tr><th>Date</th><th>Event type</th><th>Area</th><th>Severity</th><th>Status</th></tr></thead><tbody>{data.incidents.map(i=><tr key={i.id}><td>{i.date}</td><td><b>{i.type}</b></td><td>{i.area}</td><td>{i.severity}</td><td>{i.status}</td></tr>)}</tbody></table></div></Panel></>}
   {!['Overview','Actions','Incidents'].includes(page)&&<div className="module-grid"><div className="module-intro"><div className="module-icon"><ShieldCheck size={26}/></div><h2>{page} management</h2><p>This module is prepared for structured SCG HSE records. Add verified site data to activate its indicators and reports.</p><div className="module-checks"><span><CheckCircle2/> Monthly tracking</span><span><CheckCircle2/> Department breakdown</span><span><CheckCircle2/> Evidence & action follow-up</span></div></div><div className="module-placeholder"><div className="module-placeholder-icon"><Target size={32}/></div><h3>Module workspace</h3><p>Data-entry forms, trend analysis and KPI cards will be connected to this module.</p><button className="btn secondary" onClick={()=>notify('Module structure saved for next development phase')}>Configure module <ArrowUpRight size={15}/></button></div></div>}
   <footer><span>SCG · Safety Performance 360</span><span>Prototype v1.0 · Data stored in this browser</span><button onClick={reset}>Restore demo data</button></footer>
   </div></main>{toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
 </div>;
}