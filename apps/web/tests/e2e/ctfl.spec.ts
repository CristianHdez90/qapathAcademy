import {test,expect} from '@playwright/test';
import {ctflQuestions} from '../../src/features/certification/ctfl-content';
import {emptyProgress,applyProgressCommand} from '@qapath/progress';

test.beforeEach(async({page})=>{
 await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}));
 await page.route('**/api/v1/assistant/conversations**',route=>route.fulfill({json:{data:{items:[],nextOffset:null}}}));
 await page.goto('/certification/istqb');
 await expect(page.getByRole('button',{name:'Autoevaluación · Capítulo 1',exact:true})).toBeEnabled();
});

test('chapter practice grades automatically, explains mistakes and restores saved results',async({page},testInfo)=>{
 await page.screenshot({path:testInfo.outputPath('ctfl-desktop.png')});
 await page.getByRole('button',{name:'Autoevaluación · Capítulo 1',exact:true}).click();
 const quiz=page.getByRole('region',{name:'Autoevaluación del capítulo 1'});
 for(let i=0;i<8;i++){
  const text=await quiz.locator('#ctfl-question').innerText();const q=ctflQuestions.find(q=>text.endsWith(q.q))!;
  await quiz.getByRole('radio',{name:q.options[q.correct],exact:true}).check();
  if(i<7)await quiz.getByRole('button',{name:'Siguiente',exact:true}).click();
 }
 await quiz.getByRole('button',{name:'Entregar respuestas',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Resultado de autoevaluación'})).toBeVisible();
 await expect(page.getByText('1 de 6 capítulos con autoevaluación aprobada')).toBeVisible();
 await expect(page.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByText('1 de 6 capítulos con autoevaluación aprobada')).toBeVisible();
 await page.getByRole('button',{name:'Autoevaluación · Capítulo 1',exact:true}).click();
 await page.getByRole('button',{name:'Entregar respuestas',exact:true}).click();
 await page.getByRole('button',{name:'Entregar con 8 sin responder',exact:true}).click();
 await expect(page.getByText('8 preguntas quedaron sin responder',{exact:false})).toBeVisible();
 await page.locator('.ctfl-review summary').first().click();await expect(page.locator('.ctfl-review details').first().getByText('Respuesta correcta:',{exact:false})).toBeVisible();
 await expect(page.getByText('1 de 6 capítulos con autoevaluación aprobada')).toBeVisible();
});

test('student result retries failed synchronization and remains after reload',async({page})=>{
 let state=emptyProgress();let reject=true;let writes=0;
 await page.route('**/api/v1/auth/me',route=>route.fulfill({json:{data:{id:'ctfl-student',email:'ctfl@example.test',role:'STUDENT',mfaEnabled:false}}}));
 await page.route('**/api/v1/me/progress',async route=>{
  if(route.request().method()==='PATCH'){
   writes++;
   if(reject){await route.fulfill({status:503,json:{message:'Unavailable'}});return}
   const command=route.request().postDataJSON();expect(command.kind).toBe('certification');expect(command.id).toBe('ctfl-chapter-6');
   state=applyProgressCommand(state,command);
  }
  await route.fulfill({json:{data:state}});
 });
 await page.reload();
 const chapter=page.locator('#ctfl-chapter-6');await chapter.locator(':scope > summary').click();
 await chapter.getByRole('button',{name:'Autoevaluación · Capítulo 6',exact:true}).click();
 const quiz=page.getByRole('region',{name:'Autoevaluación del capítulo 6'});
 for(let i=0;i<2;i++){
  const text=await quiz.locator('#ctfl-question').innerText();const q=ctflQuestions.find(q=>text.endsWith(q.q))!;
  await quiz.getByRole('radio',{name:q.options[q.correct],exact:true}).check();
  if(i===0)await quiz.getByRole('button',{name:'Siguiente',exact:true}).click();
 }
 await quiz.getByRole('button',{name:'Entregar respuestas',exact:true}).click();
 await expect(page.getByText('No se guardó este cambio. Tu contenido sigue disponible.',{exact:true})).toBeVisible();
 await expect(page.getByText('0 de 6 capítulos con autoevaluación aprobada')).toBeVisible();
 reject=false;await page.getByRole('button',{name:'Reintentar guardado',exact:true}).click();
 await expect(page.getByText('✓ Guardado en tu cuenta',{exact:true})).toBeVisible();
 expect(writes).toBe(2);expect(state.weeks).toHaveLength(0);
 await page.reload();await expect(page.getByText('1 de 6 capítulos con autoevaluación aprobada')).toBeVisible();
});

test('mock timer submits at deadline and counts unanswered questions',async({page})=>{
 await page.clock.install();
 await page.getByRole('button',{name:'Iniciar simulacro de 40 preguntas'}).click();
 await expect(page.getByRole('timer')).toHaveText('60:00');
 await expect(page.getByRole('navigation',{name:'Navegar preguntas'}).getByRole('button')).toHaveCount(40);
 await page.clock.fastForward(60*60*1000+1000);
 await expect(page.getByRole('heading',{name:'Resultado de simulacro'})).toBeVisible();
 await expect(page.locator('.ctfl-result-score')).toContainText('0/40');
 await expect(page.getByText('40 preguntas quedaron sin responder',{exact:false})).toBeVisible();
 await expect(page.getByRole('timer')).toHaveCount(0);
});

test('mobile readings and quiz fit 320px and expose Gherkin practice',async({page},testInfo)=>{
 await page.setViewportSize({width:320,height:740});
 const chapter=page.locator('#ctfl-chapter-4');await chapter.locator(':scope > summary').click();
 await chapter.getByText('Comparar con una solución razonada').click();
 await expect(chapter.locator('.ctfl-solution')).toContainText('Given');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await chapter.getByRole('button',{name:'Autoevaluación · Capítulo 4',exact:true}).click();
 const quiz=page.getByRole('region',{name:'Autoevaluación del capítulo 4'});
 await expect(quiz).toBeVisible();await expect(quiz.locator('#ctfl-question')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('ctfl-mobile.png')});
});
