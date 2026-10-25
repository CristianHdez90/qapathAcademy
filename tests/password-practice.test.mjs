import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),progress=require('../libs/progress/dist/index.js');
const {passwordChallenges,preparePasswordChallenge,checkTrainingPassword,assessPasswordAttempt,assessPasswordPractice,readPasswordAttempts,practiceCompleted,applyProgressCommand,emptyProgress}=progress;
const attempts=()=>passwordChallenges.map(c=>{const value=preparePasswordChallenge(c.id);return {id:c.id,value,prediction:checkTrainingPassword(value).accepted?'accept':'reject',at:'2026-10-25T00:00:00Z'}});
test('password boundaries are inclusive and a valid length still needs a digit',()=>{
 for(const [length,accepted] of [[7,false],[8,true],[20,true],[21,false]])assert.equal(checkTrainingPassword('a'.repeat(length-1)+'1').accepted,accepted);
 assert.equal(checkTrainingPassword('a'.repeat(12)).accepted,false);assert.equal(checkTrainingPassword('').accepted,false);
});
test('coverage requires each distinct challenge, matching input and a correct prediction',()=>{
 const rows=attempts();assert.equal(assessPasswordPractice(rows).complete,true);assert.equal(assessPasswordPractice(rows.slice(1)).complete,false);assert.equal(assessPasswordPractice([...rows,rows[0]]).complete,false);
 assert.equal(assessPasswordAttempt({...rows[0],prediction:'accept'}).covered,false);assert.equal(assessPasswordAttempt({...rows[0],value:'abc12345',prediction:'accept'}).covered,false);assert.equal(assessPasswordAttempt(rows[0]).covered,true);
});
test('malformed or legacy snapshots do not fabricate coverage and the API rejects premature completion',()=>{
 for(const source of ['null','{}','bad',JSON.stringify({passwordLabVersion:1,attempts:[{id:'unknown'}]}),JSON.stringify({passwordLabVersion:1,attempts:[...attempts(),attempts()[0]]})])assert.equal(readPasswordAttempts(source),null);
 const data={week:4,completion:'validated',execution:{mode:'topic',ok:true,at:'2026-10-25T00:00:00Z',source:JSON.stringify({passwordLabVersion:1,attempts:attempts().slice(1)}),output:'Intento incompleto de entrenamiento.'}};
 assert.equal(practiceCompleted({'exercise:4':JSON.stringify(data)},4),false);assert.throws(()=>applyProgressCommand(emptyProgress(),{type:'submit-evidence',kind:'exercise',id:'4',text:JSON.stringify(data)}));
 data.execution.source=JSON.stringify({passwordLabVersion:1,attempts:attempts()});assert.equal(practiceCompleted({'exercise:4':JSON.stringify(data)},4),true);
});
