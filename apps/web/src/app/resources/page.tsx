// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {academyApi} from '@/lib/academy-api';
import {Resources} from '@/components/academy/resources';
export const metadata={title:'Recursos de estudio'};
export default async function ResourcesPage(){return <Resources resources={await academyApi.resources()}/>;}
