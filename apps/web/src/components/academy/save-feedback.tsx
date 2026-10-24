'use client';
import {useProgress} from '@/features/progress/progress-provider';
export function SaveFeedback({actionKey}:{actionKey:string}){
 const {saveStates,retrySave,remote}=useProgress();const status=saveStates[actionKey];
 if(!status)return null;
 return <div className={'save-feedback '+status.state}>
  <span role={status.state==='error'?'alert':'status'}>{status.state==='saving'?'Guardando…':status.state==='error'?'No se guardó este cambio. Tu contenido sigue disponible.':remote?'✓ Guardado en tu cuenta':'✓ Guardado en este navegador'}</span>
  {status.state==='error'&&<button type="button" onClick={()=>void retrySave(actionKey)}>Reintentar guardado</button>}
 </div>;
}
