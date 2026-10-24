'use client';
import {useEffect,useState} from 'react';
import './practical-exercise.css';
type Product={id:string;name:string;price:number;available:boolean};
type Quote={subtotal:number;discount:number;shipping:number;total:number};
const statusCodes=[200,201,202,204,400,401,403,404,409,422,429,500,503];
export function PracticePlayground(){
 const [products,setProducts]=useState<Product[]>([]),[catalogError,setCatalogError]=useState('');
 const [productId,setProductId]=useState('basic'),[quantity,setQuantity]=useState('1'),[coupon,setCoupon]=useState(''),[shipping,setShipping]=useState('pickup'),[defect,setDefect]=useState(false);
 const [quote,setQuote]=useState<Quote|null>(null),[quoteError,setQuoteError]=useState(''),[quoting,setQuoting]=useState(false);
 const [code,setCode]=useState('200'),[mode,setMode]=useState('status'),[token,setToken]=useState('none'),[scope,setScope]=useState('read'),[running,setRunning]=useState(false),[result,setResult]=useState<{status:number;body:string;headers:Record<string,string|null>}|null>(null),[requestError,setRequestError]=useState('');
 useEffect(()=>{const controller=new AbortController();void fetch('/api/v1/practice/products',{signal:controller.signal,cache:'no-store',credentials:'omit'}).then(async response=>{if(!response.ok)throw new Error('No se pudo cargar el catálogo de práctica.');const body=await response.json();setProducts(body.data)}).catch(e=>{if(!controller.signal.aborted)setCatalogError(e instanceof Error?e.message:'Catálogo no disponible.')});return()=>controller.abort()},[]);
 async function calculate(){
  if(quoting)return;setQuoting(true);setQuote(null);setQuoteError('');
  try{const response=await fetch('/api/v1/practice/quotes',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId,quantity:quantity.trim()===''?null:Number(quantity),coupon,shipping})});const body=await response.json();if(!response.ok)throw new Error(`HTTP ${response.status}: ${body.error||'Error de práctica'}`);if(!body.data||!['subtotal','discount','shipping','total'].every(key=>typeof body.data[key]==='number'&&Number.isFinite(body.data[key])))throw new Error('Contrato de cotización inválido.');setQuote(body.data)}
  catch(e){setQuoteError(e instanceof Error?e.message:'No se pudo cotizar.')}finally{setQuoting(false)}
 }
 async function run(){
  if(running)return;setRunning(true);setRequestError('');setResult(null);
  try{const url=mode==='status'?`/api/v1/practice/status/${code}`:`/api/v1/practice/access?scope=${scope}`;
   const response=await fetch(url,{credentials:'omit',cache:'no-store',headers:mode==='access'&&token!=='none'?{Authorization:`Bearer ${token}`}:{}});
   const text=await response.text();let body=text;try{body=JSON.stringify(JSON.parse(text),null,2)}catch{}
   setResult({status:response.status,body:body||'(sin cuerpo)',headers:{'content-type':response.headers.get('content-type'),'retry-after':response.headers.get('retry-after'),'www-authenticate':response.headers.get('www-authenticate'),'x-qapath-sandbox':response.headers.get('x-qapath-sandbox')}});
  }catch(e){setRequestError(e instanceof Error?e.message:'Error de red.')}finally{setRunning(false)}
 }
 async function downloadPostman(){
  setRequestError('');try{const response=await fetch('/practice/kit/qapath.postman_collection.json');if(!response.ok)throw new Error('No se pudo descargar la colección.');const collection=await response.json();collection.variable.find((v:{key:string})=>v.key==='baseUrl').value=window.location.origin;const url=URL.createObjectURL(new Blob([JSON.stringify(collection,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='qapath.postman_collection.json';a.click();URL.revokeObjectURL(url)}catch(e){setRequestError(e instanceof Error?e.message:'No se pudo descargar.')}
 }
 return <div className="practice-playground"><div className="page-heading"><div><p className="eyebrow">LABORATORIO DE EJECUCIÓN</p><h1>QA Store · entorno de práctica</h1><p className="page-description">Ejecuta escenarios, compara resultados y reúne evidencia desde fundamentos hasta automatización.</p></div></div>
  <p className="practice-banner">Todos los productos, roles y tokens de este entorno son ficticios. Las cotizaciones no crean pedidos, no cobran dinero y no modifican usuarios ni progreso. Los códigos de error del simulador son intencionales.</p>
  <div className="practice-links"><button type="button" className="button button-primary" onClick={()=>void downloadPostman()}>↓ Colección de Postman</button><a className="button button-outline" href="/practice/qapath-practice-kit.zip" download>↓ Kit completo de prácticas</a></div>
  <div className="practice-grid"><section className="practice-card" aria-label="Cotizador QA Store"><h2>Cotizador para tus pruebas</h2><ul className="practice-rules"><li>Cantidad: entero entre 1 y 5.</li><li>QA10: 10 % de descuento si el subtotal es de al menos 100000 COP.</li><li>Recogida: 0 COP. Envío: 10000 COP. El descuento excluye el envío.</li></ul>
   {catalogError&&<p role="alert" className="feedback bad">{catalogError}</p>}
   <form noValidate className="practice-form" onSubmit={event=>{event.preventDefault();void calculate()}}><label>Producto ficticio<select aria-label="Producto ficticio" value={productId} onChange={e=>setProductId(e.target.value)}>{products.length?products.map(p=><option key={p.id} value={p.id}>{p.name} · {p.price} COP{p.available?'':' · Sin cupos'}</option>):<option value="basic">Curso básico · 35000 COP</option>}</select></label>
    <label>Cantidad<input inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><label>Cupón<input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Opcional: QA10"/></label><label>Envío<select aria-label="Envío" value={shipping} onChange={e=>setShipping(e.target.value)}><option value="pickup">Recogida · 0 COP</option><option value="delivery">Envío · 10000 COP</option></select></label>
    <label className="practice-toggle"><input type="checkbox" checked={defect} onChange={e=>setDefect(e.target.checked)}/>Activar defecto de cálculo (solo práctica)</label><button className="button button-primary" disabled={quoting}>{quoting?'Cotizando…':'Cotizar'}</button></form>
   {quoteError&&<p role="alert" className="feedback bad">{quoteError}</p>}
   {quote&&<div role="status"><p>Total mostrado en la interfaz</p><p className="practice-total" data-testid="quote-total">{quote.total-(defect&&quote.shipping===10000&&quote.discount>0?1000:0)} COP</p><details><summary>Ver respuesta real de la API</summary><pre className="code-block">{JSON.stringify(quote,null,2)}</pre></details></div>}
  </section>
  <section className="practice-card" aria-label="Explorador HTTP"><h2>Explorador HTTP</h2><p>Primero ejecuta aquí; después reproduce la solicitud y sus aserciones en Postman. Un 401 no es lo mismo que un 403.</p>
   <form className="practice-form" onSubmit={event=>{event.preventDefault();void run()}}><label>Escenario<select aria-label="Escenario" value={mode} onChange={e=>setMode(e.target.value)}><option value="status">Código HTTP controlado</option><option value="access">Autorización ficticia</option></select></label>
    {mode==='status'?<label>Código esperado<select aria-label="Código esperado" value={code} onChange={e=>setCode(e.target.value)}>{statusCodes.map(status=><option key={status} value={status}>{status}</option>)}</select></label>:<><label>Token de demostración<select aria-label="Token de demostración" value={token} onChange={e=>setToken(e.target.value)}><option value="none">Sin token</option><option value="demo-reader">demo-reader (lectura)</option><option value="demo-admin">demo-admin (lectura y escritura)</option></select></label><label>Permiso solicitado<select aria-label="Permiso solicitado" value={scope} onChange={e=>setScope(e.target.value)}><option value="read">read</option><option value="write">write</option></select></label></>}
    <button className="button button-primary" disabled={running}>{running?'Ejecutando…':'Ejecutar solicitud HTTP'}</button></form>
   {requestError&&<p role="alert" className="feedback bad">{requestError}</p>}
   {result&&<div className="practice-result" role="status"><span className="practice-status">HTTP {result.status}</span><h3>Headers observados</h3><pre className="code-block">{JSON.stringify(result.headers,null,2)}</pre><h3>Cuerpo observado</h3><pre className="code-block">{result.body}</pre></div>}
  </section></div>
 </div>;
}
