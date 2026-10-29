// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
export const metadata={title:'Ruta de aprendizaje'};
export default function ModulesPage(){redirect('/courses')}
