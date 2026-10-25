'use client';
export type LessonPage={id:string;title:string};
export function LessonPagination({pages,activeId,onChange,bottom=false}:{pages:LessonPage[];activeId:string;onChange:(id:string)=>void;bottom?:boolean}){
 const index=pages.findIndex(page=>page.id===activeId);
 return <nav className={'lesson-pagination'+(bottom?' lesson-pagination-bottom':'')} aria-label={bottom?'Continuar en la clase':'Navegación paginada de la clase'}>
 <p className="lesson-page-counter" role="status">Apartado {index+1} / {pages.length}<span className="pagination-accessible-label"> · {pages[index]?.title}</span></p>
 {!bottom&&<label className="lesson-page-picker"><span className="pagination-accessible-label">Ir a un apartado</span><select value={activeId} onChange={event=>onChange(event.target.value)}>{pages.map((page,i)=><option key={page.id} value={page.id}>{i+1}. {page.title}</option>)}</select></label>}
 <div className="lesson-pagination-actions"><button type="button" className="button button-outline" disabled={index<=0} onClick={()=>onChange(pages[index-1].id)}>← Anterior</button><button type="button" className="button button-primary" disabled={index>=pages.length-1} onClick={()=>onChange(pages[index+1].id)}>Siguiente →</button></div>
 </nav>;
}
