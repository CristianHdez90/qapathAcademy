// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {academyApi} from '@/lib/academy-api';
import {Heading} from '@/components/ui/heading';
import {ModuleBrowser} from '@/components/academy/module-browser';
import {CtflCard} from '@/components/academy/ctfl-card';
export const metadata={title:'Ruta de aprendizaje'};
export default async function ModulesPage(){const modules=await academyApi.modules();return <><Heading eyebrow="PLAN DE APRENDIZAJE · 24 SEMANAS" title="Tu ruta, paso a paso" description="Ocho módulos diseñados para pasar de criterios de aceptación a automatización E2E profesional, más preparación complementaria para ISTQB Foundation Level."/><CtflCard/><ModuleBrowser modules={modules}/></>}
