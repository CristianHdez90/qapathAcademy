'use client';
export default function CourseError({reset}:{reset:()=>void}){return <section role="alert"><h1>No pudimos cargar este curso</h1><p>El servicio puede estar temporalmente no disponible. Tus avances no se han modificado.</p><button className="button button-primary" onClick={reset}>Reintentar</button></section>}
