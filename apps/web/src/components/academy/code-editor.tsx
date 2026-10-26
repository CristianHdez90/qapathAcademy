'use client';
import {useRef} from 'react';
import './code-editor.css';

// Keep highlighting as text nodes: student input never becomes HTML.
function highlight(source:string){
 const pattern=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(function|const|let|return|if|throw|new|for|of|try|catch|instanceof|true|false|async|await)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()|\b([A-Za-z_$][\w$]*)\b/g;
 const tokens=[];let offset=0;for(const match of source.matchAll(pattern)){
  tokens.push(source.slice(offset,match.index));
  const kind=match[1]?'comment':match[2]?'string':match[3]?'keyword':match[4]?'number':match[5]?'function':'variable';
  tokens.push(<span key={match.index} className={'syntax-'+kind}>{match[0]}</span>);offset=match.index!+match[0].length;
 }tokens.push(source.slice(offset));return tokens;
}

export function CodeEditor({value,onChange,disabled=false,language='JavaScript',topic='general'}:{value:string;onChange:(source:string)=>void;disabled?:boolean;language?:string;topic?:'general'|'json'}){
 const preview=useRef<HTMLPreElement>(null),gutter=useRef<HTMLDivElement>(null);
 return <div className="training-code-editor" data-disabled={disabled}>
  <div className="code-window-bar"><span className="code-window-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/></svg></span><span className="code-window-bug" role="img" aria-label="Mariquita QA" title="Mariquita QA"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m8 8-3-3m11 3 3-3M6 12H3m15 0h3M7 17l-3 3m13-3 3 3M10 5 9 2m5 3 1-3"/><ellipse cx="12" cy="13" rx="7" ry="8" fill="#ed827e" stroke="#132e38"/><path d="M12 7v14" stroke="#132e38"/><path d="M8 7a4 4 0 0 1 8 0" fill="#183c40"/><g fill="#183c40" stroke="none"><circle cx="8.5" cy="11" r="1.2"/><circle cx="15.5" cy="11" r="1.2"/><circle cx="8.5" cy="16" r="1.2"/><circle cx="15.5" cy="16" r="1.2"/></g></svg></span><span className="code-window-javascript" role="img" aria-label="JavaScript" title="JavaScript">JS</span>{topic==='json'?<><span className="code-window-json" role="img" aria-label="JSON" title="JSON"><b aria-hidden="true">{'{}'}</b><small aria-hidden="true">JSON</small></span><span className="code-window-typescript" role="img" aria-label="TypeScript" title="TypeScript">TS</span></>:<><span className="code-window-typescript" role="img" aria-label="TypeScript" title="TypeScript">TS</span></>}<span className="code-window-filename">experimento.{language==='TypeScript'?'ts':'js'}</span><span>{language}</span></div>
  <div className="code-editing-surface">
   <div className="code-line-numbers" ref={gutter} aria-hidden="true">{value.split('\n').map((_,i)=><div key={i}>{i+1}</div>)}</div>
   <pre ref={preview} className="code-highlight" aria-hidden="true"><code>{highlight(value)}{'\n'}</code></pre>
   <textarea aria-label="Código de la práctica" aria-describedby="code-editor-help" spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" maxLength={6000} disabled={disabled} value={value} onChange={e=>onChange(e.target.value)} onScroll={e=>{if(preview.current){preview.current.scrollTop=e.currentTarget.scrollTop;preview.current.scrollLeft=e.currentTarget.scrollLeft}if(gutter.current)gutter.current.scrollTop=e.currentTarget.scrollTop}} onKeyDown={e=>{if(e.key!=='Tab'||e.shiftKey)return;e.preventDefault();const editor=e.currentTarget,start=editor.selectionStart,end=editor.selectionEnd;if(value.length-(end-start)+2>6000)return;onChange(value.slice(0,start)+'  '+value.slice(end));requestAnimationFrame(()=>editor.setSelectionRange(start+2,start+2))}}/>
  </div>
  <div className="code-editor-footer" id="code-editor-help"><span>Escribe y modifica el código · Tab inserta 2 espacios · Mayús + Tab sale del editor</span><span>{value.split('\n').length} líneas</span></div>
 </div>;
}
