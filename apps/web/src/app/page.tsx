// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {academyApi} from '@/lib/academy-api';
import {Dashboard} from '@/components/academy/dashboard';
export default async function Home(){const modules=await academyApi.modules();return <Dashboard modules={modules} weeks={modules.flatMap(m=>m.weekDetails)}/>;}
