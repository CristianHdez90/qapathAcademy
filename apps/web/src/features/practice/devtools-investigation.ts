export const quoteExpected=104500;
export type DevToolsObservation={api:number;ui:number;status:number;defect:boolean;at:string};
export type DevToolsInvestigation={version:1;reproduction?:DevToolsObservation;diagnosis?:'presentation';retest?:DevToolsObservation};
export function reproduced(value?:DevToolsObservation){return !!value&&value.status===200&&value.defect&&value.api===quoteExpected&&value.ui===quoteExpected-1000}
export function investigationComplete(value:DevToolsInvestigation){return reproduced(value.reproduction)&&value.diagnosis==='presentation'&&!!value.retest&&!value.retest.defect&&value.retest.status===200&&value.retest.api===quoteExpected&&value.retest.ui===quoteExpected}
export function readInvestigation(source?:string):DevToolsInvestigation{
 const empty:DevToolsInvestigation={version:1};try{const data=JSON.parse(source||'{}').investigation;if(data?.version!==1)return empty;
 const observation=(v:unknown):DevToolsObservation|undefined=>{if(!v||typeof v!=='object')return;const row=v as DevToolsObservation;if(!Number.isFinite(row.api)||!Number.isFinite(row.ui)||!Number.isInteger(row.status)||row.status<100||row.status>599||typeof row.defect!=='boolean'||typeof row.at!=='string'||!Number.isFinite(Date.parse(row.at)))return;return {api:row.api,ui:row.ui,status:row.status,defect:row.defect,at:row.at}};
 const reproduction=observation(data.reproduction),retest=observation(data.retest);return {version:1,...(reproduced(reproduction)?{reproduction}:{}),...(reproduced(reproduction)&&data.diagnosis==='presentation'?{diagnosis:'presentation' as const}:{}),...(retest?{retest}:{})};
 }catch{return empty}
}
