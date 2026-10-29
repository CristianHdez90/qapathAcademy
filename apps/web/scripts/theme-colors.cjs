/**
 * SPEC-UX-310 · Tema en toda la plataforma.
 * Cada color hexadecimal de las hojas de estilo se convierte en `var(--q-<hex>,<hex>)`. Sin tema publicado
 * (o con «QAPath Original») las variables no existen y se usa el color original: el diseño no cambia.
 */
const HEX=/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;
function normalize(hex){
 let h=hex.toLowerCase();
 if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');
 if(h.length===8&&h.endsWith('ff'))h=h.slice(0,6);
 return h;
}
function rewrite(value){
 if(!value||!value.includes('#')||/url\(/i.test(value)||value.includes('var(--q-'))return value;
 return value.replace(HEX,(match,hex,offset,whole)=>{
  if(whole.slice(Math.max(0,offset-8),offset).includes('--q-'))return match;
  return `var(--q-${normalize(hex)},${match})`;
 });
}
function collect(css,set){for(const m of css.matchAll(HEX))set.add(normalize(m[1]));return set;}
const plugin=()=>({postcssPlugin:'qapath-theme-colors',Declaration(decl){if(decl.value.includes('var(--q-'))return;const next=rewrite(decl.value);if(next!==decl.value)decl.value=next;}});
plugin.postcss=true;
module.exports=plugin;
module.exports.rewrite=rewrite;module.exports.collect=collect;module.exports.normalize=normalize;
