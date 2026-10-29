'use client';
import {useMemo,useState} from 'react';
import {ReactFlow,Background,Controls,MarkerType,Position,type Edge,type Node} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {GraphInteraction} from '@qapath/contracts';
import {studyPalette} from './study-theme';
type GraphNode=GraphInteraction['nodes'][number];
const GROUP_SLOT:Record<GraphNode['group'],number>={primary:0,accent:2,info:5,warning:3,neutral:-1};
/** Capas por camino más largo desde las raíces (tolerante a ciclos). */
function layout(graph:GraphInteraction){
 const level=new Map(graph.nodes.map(n=>[n.id,0]));
 for(let pass=0;pass<graph.nodes.length;pass++){let changed=false;for(const e of graph.edges){const next=(level.get(e.from)??0)+1;if(next>(level.get(e.to)??0)&&next<graph.nodes.length){level.set(e.to,next);changed=true}}if(!changed)break}
 const rows=new Map<number,number>();
 return new Map(graph.nodes.map(n=>{const l=level.get(n.id)??0,r=rows.get(l)??0;rows.set(l,r+1);const across=l*290,down=r*120;return [n.id,graph.direction==='TB'?{x:down*1.9,y:across*0.6}:{x:across,y:down}]}));
}
/** Grafo interactivo (React Flow): al seleccionar un nodo se abre su globo explicativo. */
export function FlowGraph({graph}:{graph:GraphInteraction}){
 const [selected,setSelected]=useState<string|null>(graph.nodes.find(n=>n.detail)?.id??null);
 const palette=useMemo(()=>studyPalette(),[]);
 const {nodes,edges}=useMemo(()=>{
  const at=layout(graph),lr=graph.direction!=='TB';
  const nodes:Node[]=graph.nodes.map(n=>{const slot=GROUP_SLOT[n.group],accent=slot<0?palette.border:palette.series[slot];const pos=n.x!==undefined&&n.y!==undefined?{x:n.x,y:n.y}:at.get(n.id)!;
   return {id:n.id,position:pos,data:{label:n.label},sourcePosition:lr?Position.Right:Position.Bottom,targetPosition:lr?Position.Left:Position.Top,ariaLabel:`${n.label}${n.detail?' · tiene explicación':''}`,
    className:`study-flow-node${n.id===selected?' is-selected':''}${n.detail?' has-detail':''}`,style:{borderColor:accent,boxShadow:n.id===selected?`0 0 0 3px ${palette.primary}`:undefined}}});
  const edges:Edge[]=graph.edges.map((e,i)=>({id:`e${i}`,source:e.from,target:e.to,label:e.label,animated:e.animated,markerEnd:{type:MarkerType.ArrowClosed,color:palette.muted},style:{stroke:palette.muted,strokeWidth:2},labelStyle:{fill:palette.text,fontWeight:600},labelBgStyle:{fill:palette.surface}}));
  return {nodes,edges};
 },[graph,palette,selected]);
 const current=graph.nodes.find(n=>n.id===selected);
 return <figure className="study-figure study-graph">
  <figcaption>{graph.title}{graph.description&&<span>{graph.description}</span>}</figcaption>
  <div className="study-graph-layout">
   <div className="study-graph-canvas"><ReactFlow nodes={nodes} edges={edges} colorMode={palette.light?'light':'dark'} fitView fitViewOptions={{padding:.15,maxZoom:1.15}} nodesDraggable={false} nodesConnectable={false} elementsSelectable minZoom={.3} maxZoom={2} proOptions={{hideAttribution:true}} onNodeClick={(_,node)=>setSelected(node.id)}><Background gap={22} color={palette.border}/><Controls showInteractive={false}/></ReactFlow></div>
   <aside className="study-balloon" aria-live="polite">{current?.detail?<><p className="eyebrow">{current.label}</p><h4>{current.detail.title||current.label}</h4><p>{current.detail.text}</p>{current.detail.bullets&&<ul>{current.detail.bullets.map(b=><li key={b}>{b}</li>)}</ul>}</>:current?<><h4>{current.label}</h4><p className="hint">Este nodo no tiene explicación adicional.</p></>:<p className="hint">Selecciona un nodo para ver su explicación.</p>}</aside>
  </div>
  <div className="study-graph-keys" role="group" aria-label={`Nodos de «${graph.title}»`}>{graph.nodes.map(n=><button key={n.id} type="button" aria-pressed={n.id===selected} onClick={()=>setSelected(n.id)}>{n.label}</button>)}</div>
 </figure>;
}
