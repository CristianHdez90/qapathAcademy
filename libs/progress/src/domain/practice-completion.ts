import {readSprintPractice,assessSprintPractice} from './sprint-practice';
import {assessFoundationEvidence} from './foundation-practice';
import {readPasswordAttempts,assessPasswordPractice} from './password-practice';
import {readBugMission,assessBugMission} from './bug-practice';
const modes:Record<number,readonly string[]>={2:['topic'],3:['topic'],4:['topic'],5:['topic'],6:['topic'],7:['http','sql','git'],8:['sql','git'],9:['code','git'],10:['code'],11:['code'],12:['code'],13:['scenario'],14:['topic'],15:['scenario'],16:['scenario'],17:['topic'],18:['topic'],19:['http'],20:['scenario'],21:['pipeline'],22:['pipeline'],23:['scenario','http','sql','code','pipeline'],24:['topic']};
/** Completion is derived from a saved validation; narrative drafts never award credit. */
export function practiceCompleted(evidence:Record<string,string>,week:number):boolean{
 const text=evidence[`exercise:${week}`];if(!text)return false;
 try{const data=JSON.parse(text);if(data.completion!=='validated')return false;
  if(week===1)return assessFoundationEvidence(text).complete;
  const run=data.execution;
  if(week===4){const attempts=readPasswordAttempts(run?.source||'');if(!attempts||!assessPasswordPractice(attempts).complete)return false;}
  if(week===6){const sprint=readSprintPractice(run?.source||'');if(!sprint?.validatedAt||!assessSprintPractice(sprint).complete)return false;}
  if(week===5){const mission=readBugMission(run?.source||'');if(!mission||!assessBugMission(mission).complete)return false;}
  return data.week===week&&!!run&&run.ok===true&&modes[week]?.includes(run.mode)===true&&typeof run.source==='string'&&run.source.trim().length>0&&run.source.length<=6000&&typeof run.output==='string'&&run.output.trim().length>0&&run.output.length<=2500&&typeof run.at==='string'&&Number.isFinite(Date.parse(run.at));
 }catch{return false}
}
