// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {academyApi} from '@/lib/academy-api';
export default async function ApiStatus(){
 const modules=await academyApi.modules();
 return <main><h1>Conexión API correcta</h1><p>{modules.length} módulos de aprendizaje disponibles.</p></main>;
}
