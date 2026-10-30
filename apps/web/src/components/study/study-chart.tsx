'use client';
import {useMemo,useState} from 'react';
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,AreaChart,Area,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,Legend,CartesianGrid} from 'recharts';
import type {ChartInteraction} from '@qapath/contracts';
import {studyPalette} from './study-theme';
/** Gráfica (Recharts) con tooltip, leyenda y vista de tabla como alternativa accesible. */
export function StudyChart({chart}:{chart:ChartInteraction}){
 const p=useMemo(()=>studyPalette(),[]),[table,setTable]=useState(false);
 const fmt=(value:unknown)=>typeof value==='number'?`${value.toLocaleString('es')}${chart.unit?` ${chart.unit}`:''}`:String(value);
 const axis={stroke:p.muted,tick:{fill:p.muted,fontSize:13},tickLine:false};
 const tooltip=<Tooltip formatter={fmt} contentStyle={{background:p.surface,border:`1px solid ${p.border}`,borderRadius:10,color:p.text}} labelStyle={{color:p.text,fontWeight:700}} itemStyle={{color:p.text}} cursor={{fill:p.border,fillOpacity:.35,stroke:p.muted}}/>;
 const legend=chart.series.length>1?<Legend wrapperStyle={{color:p.text}}/>:null;
 const grid=<CartesianGrid stroke={p.border} strokeDasharray="3 4" vertical={false}/>;
 const multi=chart.series.length>1;
 const body=chart.chart==='pie'?<PieChart><Pie data={chart.data} dataKey={chart.series[0].key} nameKey={chart.xKey} innerRadius="45%" outerRadius="80%" paddingAngle={1} stroke={p.surface} strokeWidth={2} label={({name})=>String(name)}>{chart.data.map((_,i)=><Cell key={i} fill={p.series[i%p.series.length]}/>)}</Pie>{tooltip}<Legend wrapperStyle={{color:p.text}}/></PieChart>
  :chart.chart==='line'?<LineChart data={chart.data}>{grid}<XAxis dataKey={chart.xKey} {...axis}/><YAxis {...axis} width={48}/>{tooltip}{legend}{chart.series.map((s,i)=><Line key={s.key} dataKey={s.key} name={s.label} stroke={p.series[i]} strokeWidth={2} dot={{r:4}} activeDot={{r:6}}/>)}</LineChart>
  :chart.chart==='area'?<AreaChart data={chart.data}>{grid}<XAxis dataKey={chart.xKey} {...axis}/><YAxis {...axis} width={48}/>{tooltip}{legend}{chart.series.map((s,i)=><Area key={s.key} dataKey={s.key} name={s.label} stroke={p.series[i]} fill={p.series[i]} fillOpacity={.22} strokeWidth={2}/>)}</AreaChart>
  :<BarChart data={chart.data} barGap={2}>{grid}<XAxis dataKey={chart.xKey} {...axis}/><YAxis {...axis} width={48}/>{tooltip}{legend}{chart.series.map((s,i)=><Bar key={s.key} dataKey={s.key} name={s.label} fill={p.series[i]} radius={[4,4,0,0]} maxBarSize={multi?28:44}/>)}</BarChart>;
 return <figure className="study-figure study-chart">
  <figcaption>{chart.title}{chart.description&&<span>{chart.description}</span>}</figcaption>
  <div className="study-chart-tools"><button type="button" className="button button-outline" aria-pressed={table} onClick={()=>setTable(v=>!v)}>{table?'Ver gráfica':'Ver tabla'}</button></div>
  {table?<div className="catalog-table-scroll"><table><caption>{chart.title}</caption><thead><tr><th>{chart.xKey}</th>{chart.series.map(s=><th key={s.key}>{s.label}</th>)}</tr></thead><tbody>{chart.data.map((row,i)=><tr key={i}><td>{String(row[chart.xKey])}</td>{chart.series.map(s=><td key={s.key}>{fmt(row[s.key])}</td>)}</tr>)}</tbody></table></div>
  :<div className="study-chart-canvas" role="img" aria-label={`${chart.title}. Usa «Ver tabla» para leer los valores.`}><ResponsiveContainer width="100%" height="100%">{body}</ResponsiveContainer></div>}
 </figure>;
}
