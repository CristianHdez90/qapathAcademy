import type {StudyGuide} from '@qapath/contracts';
import {ReadingConcepts} from './reading-concepts';

/** Static, inert blueprint of exactly one original chapter. No live demonstration is mounted. */
export function ReadingReference({guide,chapter}:{guide:StudyGuide;chapter:number}){
 const example=chapter===guide.sections.length,source=example?guide.example:guide.sections[chapter];
 const body=example?guide.example.context:guide.sections[chapter].body;
 return <div className="app-shell"><aside className="sidebar"/><main className="main-content"><div className="lesson-page"><div className="study-grid"><div className="study-content"><section className="study-section" data-reference-chapter>
  <div className="chapter-label">{example?'PRÁCTICA GUIADA':`CAPÍTULO ${String(chapter+1).padStart(2,'0')}`}</div><h2>{source.title}</h2><p>{body}</p>
  {source.concepts?<ReadingConcepts concepts={source.concepts}/>:example&&<ol className="number-list" data-reference-tail="steps">{guide.example.steps.map((item,i)=><li key={i}>{item}</li>)}</ol>}
  {!example&&guide.sections[chapter].points.length>0&&<ul className="bullet-list" data-reference-tail="points">{guide.sections[chapter].points.map((item,i)=><li key={i}>{item}</li>)}</ul>}
  {example&&guide.example.code&&<pre className="code-block" data-reference-tail="code"><code>{guide.example.code}</code></pre>}
 </section></div><aside className="study-aside"/></div></div></main></div>;
}
