// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {academyApi} from '@/lib/academy-api';
import {ScrumExplorer} from '@/components/academy/scrum-explorer';
export const metadata={title:'Equipo interdisciplinario y Scrum'};
export default async function ScrumPage(){return <ScrumExplorer data={await academyApi.scrum()}/>;}
