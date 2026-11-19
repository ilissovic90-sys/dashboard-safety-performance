import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Eye, EyeOff, BarChart3, LineChart as LineIcon, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS=['#ffbd19','#f36b4a','#2386f4','#7555c7','#0b9b83','#a9b5c6'];
const types=[['bar','Barres'],['line','Courbe'],['pie','Camembert']];
const dimensions=[['metric_label','Libellé KPI'],['department','Département'],['period_start','Date de début de période']];
const inputStyle={padding:'10px 12px',border:'1px solid #d7e0e9',borderRadius:8,width:'100%',background:'#fff',color:'#183858'};
const buttonStyle={border:0,borderRadius:8,padding:'10px 14px',fontWeight:700,cursor:'pointer'};
function ChartCard({config,metrics,onEdit,onDelete,onToggle,canEdit}) {
 const selected=metrics.filter(m=>(config.metric_keys||[]).includes(m.id));
 const grouped={};
 selected.forEach(m=>{const x=config.dimension==='department'?(m.department||'Non renseigné'):config.dimension==='period_start'?(m.period_start||'Sans date'):(m.metric_label||m.metric_key);grouped[x]=(grouped[x]||0)+Number(m.metric_value||0)});
 const data=Object.entries(grouped).map(([name,value])=>({name,value}));
 const chart=<ResponsiveContainer width="100%" height={260}>{config.chart_type==='line'?<LineChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line dataKey="value" name={config.title} stroke="#2386f4" strokeWidth={3}/></LineChart>:config.chart_type==='pie'?<PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>{data.map((d,i)=><Cell key={d.name} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/><Legend/></PieChart>:<BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="value" name={config.title} fill="#2386f4" radius={[5,5,0,0]}/></BarChart>}</ResponsiveContainer>;
 return <section style={{background:'#fff',border:'1px solid #e4eaf0',borderRadius:14,padding:18,minWidth:0,boxShadow:'0 5px 18px #1838580a'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}><div><h3 style={{margin:'0 0 5px',color:'#183858'}}>{config.title}</h3><small style={{color:'#718096'}}>{types.find(t=>t[0]===config.chart_type)?.[1]||'Graphique'} · {dimensions.find(d=>d[0]===config.dimension)?.[1]||'Libellé KPI'} · {selected.length} données</small></div>
  {canEdit&&<div style={{display:'flex',gap:6}}><button title={config.visible?'Masquer':'Afficher'} onClick={()=>onToggle(config)} style={{...buttonStyle,background:'#eef3f8',color:'#183858'}}>{config.visible?<Eye size={16}/>:<EyeOff size={16}/>}</button><button title="Modifier" onClick={()=>onEdit(config)} style={{...buttonStyle,background:'#eef3f8',color:'#183858'}}><Pencil size={16}/></button><button title="Supprimer" onClick={()=>onDelete(config.id)} style={{...buttonStyle,background:'#fff0ed',color:'#b54732'}}><Trash2 size={16}/></button></div>}</div>
  {selected.length===0?<p style={{color:'#9a6700'}}>Aucune donnée liée. Modifiez ce graphique et sélectionnez des KPI.</p>:data.length===0?<p style={{color:'#718096'}}>Aucune valeur à afficher.</p>:chart}
  <div style={{fontSize:12,color:'#718096',marginTop:8}}>{selected.length} indicateur(s) sélectionné(s) · Valeur affichée : {selected.reduce((s,m)=>s+Number(m.metric_value||0),0).toLocaleString()}</div>
 </section>;
}
export default function ChartWorkspace({supabase,canEdit,mode='management'}) {
 const [metrics,setMetrics]=useState([]),[charts,setCharts]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [editing,setEditing]=useState(null),[title,setTitle]=useState(''),[type,setType]=useState('bar'),[dimension,setDimension]=useState('metric_label'),[selected,setSelected]=useState([]);
 const [filter,setFilter]=useState('');
 async function load(){setLoading(true);setError('');const [m,c]=await Promise.all([supabase.from('hse_metrics').select('*').order('metric_label'),supabase.from('hse_chart_configs').select('*').order('created_at',{ascending:false})]);if(m.error||c.error){setError((m.error||c.error).message);setLoading(false);return}setMetrics(m.data||[]);setCharts(c.data||[]);setLoading(false)}
 useEffect(()=>{load()},[]);
 function reset(){setEditing(null);setTitle('');setType('bar');setDimension('metric_label');setSelected([])}
 function startEdit(c){setEditing(c.id);setTitle(c.title);setType(c.chart_type);setDimension(c.dimension);setSelected(c.metric_keys||[]);window.scrollTo({top:0,behavior:'smooth'})}
 async function save(e){e.preventDefault();if(!title.trim()||selected.length===0)return;const payload={title:title.trim(),chart_type:type,dimension,metric_keys:selected,visible:true};const result=editing?await supabase.from('hse_chart_configs').update(payload).eq('id',editing):await supabase.from('hse_chart_configs').insert({...payload,created_by:(await supabase.auth.getUser()).data.user?.id});if(result.error){setError(result.error.message);return}reset();await load()}
 async function remove(id){if(!window.confirm('Supprimer ce graphique ?'))return;const {error}=await supabase.from('hse_chart_configs').delete().eq('id',id);if(error){setError(error.message);return}await load()}
 async function toggle(c){const {error}=await supabase.from('hse_chart_configs').update({visible:!c.visible}).eq('id',c.id);if(error){setError(error.message);return}await load()}
 const filtered=useMemo(()=>metrics.filter(m=>(m.metric_label+' '+m.metric_key+' '+(m.department||'')).toLowerCase().includes(filter.toLowerCase())),[metrics,filter]);
 const shown=charts.filter(c=>c.visible!==false);
 return <div style={{display:'grid',gap:18}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:11,fontWeight:800,letterSpacing:1.2,color:'#2386f4'}}>SCG · HSE DATA VISUALIZATION</div><h2 style={{margin:'5px 0',color:'#183858'}}>{mode==='analytics'?'Advanced HSE Analytics':'Chart Management'}</h2><p style={{margin:0,color:'#718096'}}>{mode==='analytics'?'Analyse des indicateurs HSE enregistrés dans la base partagée.':'Créez, configurez et gérez vos graphiques à partir de la bibliothèque KPI.'}</p></div><button onClick={load} style={{...buttonStyle,background:'#eef3f8',color:'#183858',display:'flex',alignItems:'center',gap:8}}><RefreshCw size={15}/> Actualiser</button></div>
  {error&&<div style={{padding:12,borderRadius:8,background:'#fff0ed',color:'#a33'}}>{error}</div>}
  {loading?<p style={{color:'#718096'}}>Chargement des données…</p>:<>
   {mode==='management'&&canEdit&&<section style={{background:'#fff',border:'1px solid #e4eaf0',borderRadius:14,padding:18}}>
    <h3 style={{marginTop:0,color:'#183858'}}>{editing?'Modifier le graphique':'Créer un nouveau graphique'}</h3>
    <form onSubmit={save} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12}}>
     <label style={{fontSize:13,color:'#52657a'}}>Titre du graphique<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex. Accidents par département" style={{...inputStyle,display:'block',marginTop:6}}/></label>
     <label style={{fontSize:13,color:'#52657a'}}>Type de graphique<select value={type} onChange={e=>setType(e.target.value)} style={{...inputStyle,display:'block',marginTop:6}}>{types.map(t=><option key={t[0]} value={t[0]}>{t[1]}</option>)}</select></label>
     <label style={{fontSize:13,color:'#52657a'}}>Axe horizontal / regroupement<select value={dimension} onChange={e=>setDimension(e.target.value)} style={{...inputStyle,display:'block',marginTop:6}}>{dimensions.map(d=><option key={d[0]} value={d[0]}>{d[1]}</option>)}</select></label>
     <label style={{fontSize:13,color:'#52657a'}}>Rechercher un KPI<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Nom, clé ou département" style={{...inputStyle,display:'block',marginTop:6}}/></label>
     <div style={{gridColumn:'1/-1'}}><b style={{fontSize:13,color:'#183858'}}>Sélectionner les données à afficher ({selected.length})</b><div style={{maxHeight:220,overflowY:'auto',border:'1px solid #e4eaf0',borderRadius:9,padding:10,marginTop:8,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:8}}>{filtered.map(m=><label key={m.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#43566b'}}><input type="checkbox" checked={selected.includes(m.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,m.id]:old.filter(id=>id!==m.id))}/><span>{m.metric_label} · <b>{Number(m.metric_value).toLocaleString()} {m.unit||''}</b>{m.department?' · '+m.department:''}</span></label>)}{!filtered.length&&<span style={{color:'#718096'}}>Aucun KPI trouvé.</span>}</div></div>
     <div style={{display:'flex',gap:8,alignItems:'center',gridColumn:'1/-1'}}><button type="submit" disabled={!title.trim()||!selected.length} style={{...buttonStyle,background:'#183858',color:'#fff',opacity:(!title.trim()||!selected.length)?.55:1}}><Plus size={15} style={{verticalAlign:'middle',marginRight:6}}/>{editing?'Enregistrer les modifications':'Ajouter le graphique'}</button>{editing&&<button type="button" onClick={reset} style={{...buttonStyle,background:'#eef3f8',color:'#183858'}}>Annuler</button>}</div>
    </form>
   </section>}
   {mode==='management'&&<div style={{fontSize:13,color:'#718096'}}>Bibliothèque : {metrics.length} KPI · Graphiques configurés : {charts.length}. Les modifications sont partagées via Supabase.</div>}
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,390px),1fr))',gap:16}}>{(mode==='analytics'?shown:charts).map(c=><ChartCard key={c.id} config={c} metrics={metrics} canEdit={mode==='management'&&canEdit} onEdit={startEdit} onDelete={remove} onToggle={toggle}/>)}</div>
   {(mode==='analytics'?shown:charts).length===0&&<div style={{padding:30,textAlign:'center',background:'#fff',border:'1px dashed #cbd5e1',borderRadius:14,color:'#718096'}}>{mode==='analytics'?'Aucun graphique publié pour le moment.':'Aucun graphique créé. Utilisez le formulaire ci-dessus pour commencer.'}</div>}
  </>}
 </div>;
}
