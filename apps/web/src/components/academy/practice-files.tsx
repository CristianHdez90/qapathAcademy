import type {PracticalExercise} from '@qapath/contracts';
import './practice-activity.css';

export function PracticeFiles({exercise}:{exercise:PracticalExercise}){
 if(!exercise.files?.length)return null;
 return <section className="activity-section practice-files" aria-label="Archivos de esta práctica"><h2>Archivos para trabajar con tu herramienta</h2><ul>{exercise.files.map(file=><li key={file.href}><a className="text-link" href={file.href} download>{file.label} ↓</a><p>{file.description}</p></li>)}</ul></section>;
}
