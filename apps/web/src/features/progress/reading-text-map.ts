/** Text identities stay stable when a concept wraps to a different width. */
type Glyph={id:number;top:number;bottom:number};
export type TextBand={start:number;end:number;ids:number[];topEdge:boolean;bottomEdge:boolean};
export type TextReference={signature:string;bands:TextBand[]};

export function textLayout(root:HTMLElement,measure=true,visibleOnly=false){
 const signature=Array.from(root.querySelectorAll('*')).filter(el=>!el.closest('svg')&&el.tagName!=='I').map(el=>el.tagName).join(',');
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),glyphs:Glyph[]=[],texts:string[]=[];
 const origin=root.getBoundingClientRect().top;let id=0;
 while(walker.nextNode()){
  const node=walker.currentNode;if(node.parentElement?.closest('svg'))continue;
  const text=node.textContent||'';texts.push(text);let offset=0,visible=true;
  if(visibleOnly)for(let parent=node.parentElement;parent;parent=parent.parentElement){
   const style=getComputedStyle(parent);
   if(parent.hidden||parent.inert||style.visibility!=='visible'||style.display==='none'||style.opacity==='0'){visible=false;break}
   if(parent===root)break;
  }
  for(const character of text){
   const current=id++;if(measure&&visible&&character.trim()){
    const range=document.createRange();range.setStart(node,offset);range.setEnd(node,offset+character.length);
    for(const rect of range.getClientRects())if(rect.width>0&&rect.height>0)glyphs.push({id:current,top:rect.top-origin,bottom:rect.bottom-origin});
   }
   offset+=character.length;
  }
 }
 return {signature:JSON.stringify([signature,texts]),glyphs};
}

export function textReference(root:HTMLElement,height:number):TextReference{
 const {signature,glyphs}=textLayout(root);
 const edges=[...new Set([0,height,...glyphs.flatMap(g=>[Math.max(0,g.top),Math.min(height,g.bottom)])])].filter(n=>n>=0&&n<=height).sort((a,b)=>a-b);
 const bands:TextBand[]=[];
 for(let i=1;i<edges.length;i++){
  const start=edges[i-1],end=edges[i];if(end<=start)continue;
  let required=glyphs.filter(g=>g.top<end&&g.bottom>start);
  let topEdge=false,bottomEdge=false;
  if(!required.length){
   const before=Math.max(...glyphs.filter(g=>g.bottom<=start).map(g=>g.bottom));
   const after=Math.min(...glyphs.filter(g=>g.top>=end).map(g=>g.top));
   topEdge=!Number.isFinite(before);bottomEdge=!Number.isFinite(after);
   required=glyphs.filter(g=>g.bottom===before||g.top===after);
  }
  bands.push({start,end,ids:[...new Set(required.map(g=>g.id))],topEdge,bottomEdge});
 }
 return {signature,bands};
}

/** Only fully exposed glyphs count; gaps need both neighbouring lines and outer edges. */
export function exposeTextBands(reference:TextReference,actual:ReturnType<typeof textLayout>,visible:[number,number],height:number,history:Set<number>,edges:{top:boolean;bottom:boolean}):[number,number][]{
 if(reference.signature!==actual.signature)return [];
 for(const glyph of actual.glyphs)if(glyph.top>=visible[0]&&glyph.bottom<=visible[1])history.add(glyph.id);
 edges.top ||= visible[0]<=0;edges.bottom ||= visible[1]>=height;
 return reference.bands.filter(band=>band.ids.length>0&&(!band.topEdge||edges.top)&&(!band.bottomEdge||edges.bottom)&&band.ids.every(id=>history.has(id))).map(band=>[band.start,band.end]);
}
