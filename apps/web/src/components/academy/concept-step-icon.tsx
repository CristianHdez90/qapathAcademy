import type {ReactNode} from 'react';
const drawings={
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
 search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
 workflow:<><rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5H5v5m7-5h7v5"/></>,
 shield:<><path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
 package:<><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5m-9 5v9M8 5l9 5"/></>,
 checklist:<><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v5H9zM8 12l1 1 2-2m2 1h3m-8 5 1 1 2-2m2 1h3"/></>,
 check:<><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></>,
 file:<><path d="M14 2H5v20h14V7l-5-5Zm0 0v6h5M8 12h8m-8 4h5"/></>,
 play:<><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/></>,
 compare:<><path d="M8 3v18m8-18v18M3 8l3-3 3 3m-3-3v12m9-1 3 3 3-3m-3 3V7"/></>,
 warning:<><path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/></>,
 code:<><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/></>,
 users:<><circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m1 3a6 6 0 0 1 5 5v3"/></>,
 target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
 pencil:<><path d="m4 16 12-12 4 4L8 20l-5 1 1-5Zm9-9 4 4"/></>,
 rocket:<><path d="M14 4c3-2 6-2 6-2s0 3-2 6l-6 8-5-5 7-7Zm-7 7-4 1-1 5 6-1m4 0-1 6 5-1 1-5M4 20l-2 2"/><circle cx="15" cy="7" r="1"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-14 4h3m4 0h3m-10 3h3"/></>,
 chart:<><path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/></>,
 layers:<><path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/></>,
 refresh:<><path d="M20 8a9 9 0 0 0-15-3L2 8m0-5v5h5m-3 8a9 9 0 0 0 15 3l3-3m0 5v-5h-5"/></>,
 grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
 message:<><path d="M3 3h18v13H9l-6 5V3Zm4 5h10M7 12h6"/></>,
 link:<><path d="m9 15 6-6m-5-3 2-2a5 5 0 0 1 7 7l-2 2m-3 5-2 2a5 5 0 0 1-7-7l2-2"/></>,
 bug:<><rect x="7" y="5" width="10" height="15" rx="5"/><path d="m8 5-2-2m10 2 2-2M3 10h4m10 0h4M3 16h4m10 0h4M12 8v12"/></>,
 calculator:<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1"/></>,
 flag:<><path d="M5 22V3h14l-3 4 3 4H5"/></>,
 receipt:<><path d="M5 2v20l4-2 3 2 3-2 4 2V2l-4 2-3-2-3 2-4-2Zm3 6h8m-8 4h8m-8 4h5"/></>,
} satisfies Record<string,ReactNode>;
type StepIcon=keyof typeof drawings;
const sequences:Record<string,readonly [StepIcon,StepIcon,StepIcon]>={
 qa:['search','workflow','shield'],qc:['package','compare','check'],testing:['checklist','play','compare'],
 error:['file','warning','search'],defect:['file','code','bug'],failure:['play','receipt','compare'],
 verification:['file','code','check'],validation:['search','users','target'],
 sdlc:['pencil','code','rocket'],stlc:['calendar','play','checklist'],iteration:['package','message','refresh'],
 refinement:['file','message','checklist'],development:['link','warning','code'],release:['checklist','message','rocket'],
 presence:['play','file','search'],exhaustive:['grid','target','checklist'],early:['search','message','shield'],
 cluster:['file','chart','shield'],refresh:['checklist','refresh','search'],context:['layers','warning','workflow'],
 useful:['check','users','warning'],evidence:['file','compare','refresh'],
 unit:['file','code','check'],integration:['link','layers','check'],system:['layers','play','check'],acceptance:['users','play','check'],
 functional:['file','play','check'],nonfunctional:['target','chart','compare'],smoke:['package','checklist','flag'],
 regression:['code','refresh','search'],explore:['target','search','file'],e2e:['play','link','check'],
 sanity:['message','target','file'],automation:['pencil','code','chart'],
 risk:['search','warning','shield'],measure:['grid','chart','calculator'],impact:['warning','layers','chart'],
 identify:['file','search','checklist'],estimate:['file','users','check'],controls:['flag','shield','check'],
 reevaluate:['refresh','chart','checklist'],high:['receipt','calculator','flag'],medium:['users','calculator','layers'],
 low:['pencil','calculator','file'],priority:['compare','checklist','message'],
};
export function ConceptStepIcon({conceptId,index,icon}:{conceptId:string;index:number;icon?:string}){
 const name=(icon&&Object.prototype.hasOwnProperty.call(drawings,icon)?icon:(sequences[conceptId]||['file','play','check'])[index]) as StepIcon;
 return <svg className="concept-demo-step-icon" data-step-icon={name} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" focusable="false">{drawings[name]}</svg>;
}
