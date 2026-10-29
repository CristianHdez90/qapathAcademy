import type {DemonstrationStepDetail} from '@qapath/contracts';

const text=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
/** Fail closed for the whole optional array; legacy demonstrations keep their explanation. */
export function demonstrationDetails(value:unknown,count:number):DemonstrationStepDetail[]|null{
 if(!Array.isArray(value)||value.length!==count||!count)return null;
 for(const detail of value){
  if(!detail||typeof detail!=='object'||!text(detail.goal)||!text(detail.evidence))return null;
  if(!Array.isArray(detail.actions)||detail.actions.length<2||detail.actions.length>4||!detail.actions.every(text))return null;
  if(detail.briefActions!==undefined&&(!Array.isArray(detail.briefActions)||detail.briefActions.length!==detail.actions.length||!detail.briefActions.every(text)))return null;
  if(detail.input!==undefined&&!text(detail.input))return null;
  if(detail.pitfall!==undefined&&!text(detail.pitfall))return null;
  if(detail.roles!==undefined&&(!Array.isArray(detail.roles)||!detail.roles.every(text)))return null;
 }
 return value as DemonstrationStepDetail[];
}
