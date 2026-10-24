'use client';
export const ASK_LIA_EVENT='qapath:ask-lia';
export function AskLia({topic,week}:{topic:string;week?:number}){
 return <button type="button" className="ask-lia-button" onClick={event=>{event.currentTarget.focus();window.dispatchEvent(new CustomEvent(ASK_LIA_EVENT,{detail:{prompt:`Estoy estudiando ${week?`la semana ${week}: `:''}${topic}. Ayúdame a comprender este tema con un ejemplo de QA y una pregunta de práctica.`.slice(0,2000)}}))}}><span aria-hidden="true">✦</span> Preguntar a MariBug sobre este tema <span aria-hidden="true">↗</span></button>;
}
