export type PasswordAttempt={id:string;value:string;prediction:'accept'|'reject';at:string};
export const passwordChallenges=[
 {id:'min-below',title:'Justo antes del mínimo',technique:'Valor límite inferior − 1',length:7,digit:true,goal:'Aísla la longitud: usa 7 caracteres e incluye un dígito.'},
 {id:'min',title:'En el mínimo',technique:'Valor límite inferior',length:8,digit:true,goal:'Prueba exactamente 8 caracteres con un dígito.'},
 {id:'max',title:'En el máximo',technique:'Valor límite superior',length:20,digit:true,goal:'Prueba exactamente 20 caracteres con un dígito.'},
 {id:'max-above',title:'Justo después del máximo',technique:'Valor límite superior + 1',length:21,digit:true,goal:'Prueba 21 caracteres con un dígito para aislar la frontera superior.'},
 {id:'interior',title:'Dentro de la partición válida',technique:'Partición de equivalencia válida',length:12,digit:true,goal:'Elige un representante interior de 12 caracteres con un dígito.'},
 {id:'no-digit',title:'Longitud correcta, sin dígito',technique:'Partición de equivalencia inválida',length:12,digit:false,goal:'Usa 12 letras sin dígitos para aislar la regla del dígito.'},
 {id:'empty',title:'Entrada vacía',technique:'Partición vacía',length:0,digit:false,goal:'Ejecuta sin escribir caracteres. ¿Cumple alguna de las dos condiciones?'}
] as const;
export function checkTrainingPassword(value:string){const length=value.length,digit=/[0-9]/.test(value),inRange=length>=8&&length<=20;return {length,digit,inRange,accepted:inRange&&digit,reason:inRange?(digit?'Cumple la longitud de 8 a 20 y contiene un dígito.':'La longitud cumple, pero falta un dígito.'):length<8?'Tiene menos de 8 caracteres.': 'Supera los 20 caracteres.'}}
export function preparePasswordChallenge(id:string){const challenge=passwordChallenges.find(item=>item.id===id);return !challenge?'':challenge.digit?'a'.repeat(challenge.length-1)+'1':'a'.repeat(challenge.length)}
export function assessPasswordAttempt(attempt:PasswordAttempt){
 const challenge=passwordChallenges.find(item=>item.id===attempt.id),result=checkTrainingPassword(attempt.value);
 const matches=!!challenge&&result.length===challenge.length&&result.digit===challenge.digit;
 const correct=attempt.prediction===(result.accepted?'accept':'reject');
 return {...result,matches,correct,covered:matches&&correct,message:!matches?'El dato no corresponde al desafío. Revisa la longitud y la presencia de dígitos indicadas.':correct?'Predicción confirmada: comparaste correctamente la regla con el resultado.':'Tu predicción no coincide con la regla. Revisa la condición incumplida y vuelve a intentarlo.'};
}
export function readPasswordAttempts(source:string):PasswordAttempt[]|null{
 try{const data=JSON.parse(source);if(data.passwordLabVersion!==1||!Array.isArray(data.attempts)||data.attempts.length>7)return null;const ids=new Set<string>();
 const attempts:PasswordAttempt[]=[];for(const item of data.attempts){if(!item||!passwordChallenges.some(c=>c.id===item.id)||ids.has(item.id)||typeof item.value!=='string'||item.value.length>32||!['accept','reject'].includes(item.prediction)||typeof item.at!=='string'||!Number.isFinite(Date.parse(item.at)))return null;ids.add(item.id);attempts.push({id:item.id,value:item.value,prediction:item.prediction,at:item.at})}return attempts;
 }catch{return null}
}
export function assessPasswordPractice(attempts:readonly PasswordAttempt[]){const covered=passwordChallenges.filter(challenge=>{const matches=attempts.filter(item=>item.id===challenge.id);return matches.length===1&&assessPasswordAttempt(matches[0]).covered}).map(item=>item.id);return {covered,total:passwordChallenges.length,complete:covered.length===passwordChallenges.length};}
