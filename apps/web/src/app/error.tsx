'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){
 return <section className="page-heading"><div><h1>No fue posible cargar el contenido</h1><p>Comprueba que la API NestJS está ejecutándose y que las variables API_INTERNAL_URL y API_PROXY_TARGET apuntan a su dirección.</p><button className="button button-primary" onClick={reset}>Reintentar</button></div></section>;
}
