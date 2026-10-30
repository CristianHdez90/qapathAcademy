import {textLayout,textReference,type TextReference} from './reading-text-map';
export type Range=[number,number];
export type Piece={id:string;start:number;end:number;width:number;contentHeight:number;offset:number;landmarks:Landmark[];peers:string[];text?:TextReference};
type Landmark={tag:string;text:string;top:number;left:number;width:number;height:number};
export type ReadingGeometry={height:number;pieces:Piece[]};

function landmarks(root:HTMLElement,top:number,left:number):Landmark[]{
 const scroll=(element:Element)=>{let x=0;if(element!==root)for(let p=element.parentElement;p;p=p.parentElement){x+=p.scrollLeft;if(p===root)break}return x};
 const result=[root,...Array.from(root.querySelectorAll<HTMLElement>('*'))].filter(el=>!el.closest('svg')&&el.tagName!=='I'&&el.getClientRects().length>0).map(el=>{
  const r=el.getBoundingClientRect();return {tag:el.tagName,text:el.children.length?'':el.textContent||'',top:r.top-top,left:r.left-left+scroll(el),width:r.width,height:r.height};
 });
 // Verify every wrapped text line, not merely a paragraph's aggregate height.
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode,parent=node.parentElement;if(!parent||parent.closest('svg')||!node.textContent?.trim())continue;
  const range=document.createRange();range.selectNodeContents(node);
  const x=scroll(parent)+(parent===root?root.scrollLeft:0);
  for(const r of range.getClientRects())result.push({tag:'#line',text:node.textContent,top:r.top-top,left:r.left-left+x,width:r.width,height:r.height});
 }
 return result;
}

/** Coordinates come from browser layout, never from counts or words. Clone is always discarded. */
export function measureReadingReference(blueprint:HTMLElement,chapter:number,activeId?:string):ReadingGeometry|null{
 if(!blueprint.isConnected||!blueprint.firstElementChild)return null;
 const clone=blueprint.firstElementChild.cloneNode(true) as HTMLElement;
 clone.setAttribute('data-reading-measure','');
 const host=document.createElement('div');host.inert=true;host.setAttribute('aria-hidden','true');
 Object.assign(host.style,{position:'fixed',left:'0',top:'0',width:`${document.documentElement.clientWidth}px`,visibility:'hidden',pointerEvents:'none',zIndex:'-1'});
 host.append(clone);document.body.append(host);
 try{
  const section=clone.querySelector<HTMLElement>('[data-reference-chapter]');if(!section)return null;
  const base=section.getBoundingClientRect();if(base.width<=0||base.height<=0)return null;
  const items:Array<{id:string;node:HTMLElement;start:number;peers:string[]}>=[];
  const cells=Array.from(section.querySelectorAll<HTMLElement>('.reading-concept'));
  const tails=Array.from(section.querySelectorAll<HTMLElement>('[data-reference-tail]'));
  const first=cells[0]||tails[0];
  const introEnd=first?first.getBoundingClientRect().top-base.top:base.height;
  const pieces:Piece[]=[{id:`chapter-${chapter}--intro`,start:0,end:introEnd,width:base.width,contentHeight:0,offset:0,landmarks:[],peers:[]}];
  for(const cell of cells){
   const r=cell.getBoundingClientRect(),id=`chapter-${chapter}--concept-${cell.className.split('reading-concept-')[1]}`;
   const peers=cells.filter(other=>other.getBoundingClientRect().top===r.top).map(other=>`chapter-${chapter}--concept-${other.className.split('reading-concept-')[1]}`);
   items.push({id,node:cell,start:r.top-base.top,peers});
  }
  for(const node of tails)items.push({id:`chapter-${chapter}--${node.dataset.referenceTail}`,node,start:node.getBoundingClientRect().top-base.top,peers:[]});
  const starts=[...new Set(items.map(item=>item.start))].sort((a,b)=>a-b);
  for(const item of items){const r=item.node.getBoundingClientRect(),end=starts.find(start=>start>item.start)??base.height;pieces.push({id:item.id,start:item.start,end,width:r.width,contentHeight:r.height,offset:0,landmarks:landmarks(item.node,r.top,r.left),peers:item.peers,text:item.node.classList.contains('reading-concept')&&(!activeId||item.id===activeId)?textReference(item.node,end-item.start):undefined});}
  // Intro uses the original section's label/title/body, not the new card chrome.
  pieces[0].landmarks=Array.from(section.children).slice(0,3).flatMap(node=>landmarks(node as HTMLElement,base.top,base.left));
  return {height:base.height,pieces};
 }finally{host.remove()}
}

export function verifyReadingPiece(root:HTMLElement,piece:Piece):{valid:boolean;offset:number;diagnostic:string}{
 const content=root.querySelector<HTMLElement>('[data-source-content]');
 if(!content)return {valid:false,offset:0,diagnostic:'missing-content'};
 const node=piece.id.endsWith('--intro')?content.querySelector<HTMLElement>('.study-section'):content.querySelector<HTMLElement>('.reading-concept,[data-source-tail]');
 if(!node)return {valid:false,offset:0,diagnostic:'missing-region'};
 const r=node.getBoundingClientRect(),box=root.getBoundingClientRect();
 if(root.dataset.readingLayout==='reflow'){
  const sameBox=Math.round((box.height-r.height)*64)===0&&Math.round((box.width-r.width)*64)===0&&Math.round((box.top-r.top)*64)===0;
  const actual=textLayout(node,false).signature,valid=!!piece.text&&sameBox&&box.width>0&&box.height>0&&actual===piece.text.signature;
  return {valid,offset:0,diagnostic:valid?'text-matched':'text-mismatch'};
 }
 const actual=piece.id.endsWith('--intro')?Array.from(node.children).slice(0,3).flatMap(child=>landmarks(child as HTMLElement,r.top,r.left)):landmarks(node,r.top,r.left);
 // Layout-unit comparison removes float32 viewport-origin cancellation, not an academic epsilon.
 // The source intervals and the 80%/98% decision below retain their unrounded values.
 const same=(a:number,b:number)=>Math.round((a-b)*64)===0;
 const valid=same(box.width,piece.width)&&same(box.height,piece.end-piece.start)&&same(r.width,piece.width)&&actual.length===piece.landmarks.length&&actual.every((a,i)=>{const b=piece.landmarks[i];return a.tag===b.tag&&a.text===b.text&&same(a.top,b.top)&&same(a.left,b.left)&&same(a.width,b.width)&&same(a.height,b.height)});
 const index=valid?-1:actual.findIndex((a,i)=>JSON.stringify(a)!==JSON.stringify(piece.landmarks[i]));
 return {valid:valid&&same(box.top,r.top),offset:box.top-r.top,diagnostic:valid?'matched':JSON.stringify({width:[r.width,piece.width],height:[box.height,piece.end-piece.start],index,actual:actual[index],source:piece.landmarks[index]})};
}

export function unionRanges(ranges:readonly Range[]):Range[]{
 const result:Range[]=[];for(const [a,b] of [...ranges].sort((x,y)=>x[0]-y[0])){if(b<=a)continue;const last=result.at(-1);if(last&&a<=last[1])last[1]=Math.max(last[1],b);else result.push([a,b])}return result;
}

/** Side-by-side columns only expose a source row after every homologous column was visible. */
export function projectedReadingRanges(geometry:ReadingGeometry,exposure:ReadonlyMap<string,Range[]>):Range[]{
 const all:Range[]=[];
 for(const piece of geometry.pieces){
  let ranges=exposure.get(piece.id)||[];
  for(const peer of piece.peers.filter(id=>id!==piece.id))ranges=ranges.flatMap(([a,b])=>(exposure.get(peer)||[]).map(([c,d])=>[Math.max(a,c),Math.min(b,d)] as Range).filter(([a,b])=>b>a));
  all.push(...ranges.map(([a,b])=>[(piece.start+(piece.end-piece.start)*a)/geometry.height,(piece.start+(piece.end-piece.start)*b)/geometry.height] as Range));
 }
 return unionRanges(all);
}

export function creditReadingExposure(geometry:ReadingGeometry,piece:Piece,local:Range,channels:Map<string,Range[]>,previous:Range[]):Range[]{
 const sample:Range=[(piece.start+(piece.end-piece.start)*local[0])/geometry.height,(piece.start+(piece.end-piece.start)*local[1])/geometry.height];
 channels.set(piece.id,unionRanges([...(channels.get(piece.id)||[]),sample]));
 let credit=[sample];
 for(const peer of piece.peers.filter(id=>id!==piece.id))credit=credit.flatMap(([a,b])=>(channels.get(peer)||[]).map(([c,d])=>[Math.max(a,c),Math.min(b,d)] as Range).filter(([a,b])=>b>a));
 // Historical source intervals are retained, never reprojected after a resize or animation.
 return unionRanges([...previous,...credit]);
}
