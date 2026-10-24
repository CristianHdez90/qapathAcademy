// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {academyApi} from '@/lib/academy-api';
import {FinalProject} from '@/components/academy/final-project';
export const metadata={title:'Proyecto final'};
export default async function ProjectPage(){return <FinalProject checklist={await academyApi.finalChecklist()}/>;}
