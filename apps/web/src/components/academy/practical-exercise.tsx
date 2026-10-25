'use client';
import Link from 'next/link';
import type {PracticalExercise} from '@qapath/contracts';
import {LearningDisclosure} from './learning-disclosure';
import './practical-exercise.css';

export function PracticalExercisePanel({week,exercise}:{week:number;exercise:PracticalExercise}){
 return <LearningDisclosure id="practical-exercise" title={`Ejercicio práctico · ${exercise.title}`} description={`${exercise.minutes} min · Práctica adicional con evidencia · ${exercise.tools.join(' / ')}`}>
  <div className="practical-exercise"><p className="eyebrow">DEL CONCEPTO A LA EJECUCIÓN</p><h2>{exercise.title}</h2><p>{exercise.objective}</p>
   <p className="hint">Completa y valida esta actividad para avanzar en la etapa Práctica. Puedes guardar borradores y retomarlos después.</p>
   <div className="practical-actions"><Link href={`/practice/${week}`} className="button button-primary">Abrir actividad de la semana {week} ↗</Link><a className="button button-outline" href="/practice/qapath-practice-kit.zip" download>↓ Descargar kit práctico</a></div>
  </div>
 </LearningDisclosure>;
}
