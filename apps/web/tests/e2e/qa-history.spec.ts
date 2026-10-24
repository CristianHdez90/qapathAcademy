import {test,expect} from '@playwright/test';

test('MariBug retains every exchange after reload, archives, restores and separates accounts',async({page},testInfo)=>{
 let user='history-a',calls=0,failArchive=false;
 type Chat={id:string;title:string;revision:number;archived:boolean;updatedAt:string;messages:{role:string;content:string}[]};
 const saved=new Map<string,Chat[]>();
 await page.route('**/api/v1/auth/me',async route=>{await new Promise(resolve=>setTimeout(resolve,400));await route.fulfill({json:{data:{id:user,email:user+'@example.test',role:'STUDENT',mfaEnabled:true}}})});
 await page.route('**/api/v1/me/progress',route=>route.fulfill({json:{data:{version:2,weeks:[],read:[],tasks:[],labs:[],final:[],quizzes:{},notes:{},readingSections:{},lessonChecks:[],evidence:{},scrumIntro:false,scrumQuizScore:0,hours:9}}}));
 await page.route('**/api/v1/assistant/conversations**',async route=>{
  const id=new URL(route.request().url()).pathname.split('/conversations/')[1];const list=saved.get(user)||[];
  if(!id){await route.fulfill({json:{data:{items:list,nextOffset:null}}});return}
  const chat=list.find(c=>c.id===id);if(!chat){await route.fulfill({status:404,json:{message:'Conversación no encontrada'}});return}
  if(route.request().method()==='PATCH'){
   if(failArchive){failArchive=false;await route.fulfill({status:503,json:{message:'No se pudo archivar. Reintenta.'}});return}
   chat.archived=route.request().postDataJSON().archived;chat.revision++;
  }
  await route.fulfill({json:{data:chat}});
 });
 await page.route('**/api/v1/assistant/chat',async route=>{
  const body=route.request().postDataJSON();expect(body.keepHistory).toBe(true);expect(body.messages.length).toBeLessThanOrEqual(5);calls++;
  const list=saved.get(user)||[];let chat=list.find(c=>c.id===body.conversationId);
  if(!chat){chat={id:`00000000-0000-4000-8000-${String(calls).padStart(12,'0')}`,title:body.messages.at(-1).content,revision:0,archived:false,updatedAt:new Date().toISOString(),messages:[]};list.unshift(chat);saved.set(user,list)}
  chat.messages.push(body.messages.at(-1),{role:'assistant',content:'Respuesta de QA '+calls});chat.revision++;
  await route.fulfill({json:{data:{answer:'Respuesta de QA '+calls,conversation:chat}}});
 });
 await page.setViewportSize({width:390,height:844});await page.goto('/resources');
 await page.getByRole('button',{name:'Abrir asistente MariBug'}).click();
 const input=page.getByLabel('Tu pregunta sobre QA');
 for(let i=1;i<=4;i++){
  await expect(input).toBeEnabled();await input.fill('Pregunta de QA '+i);await page.getByRole('button',{name:'Enviar pregunta'}).click();
  await expect(page.getByRole('log')).toContainText('Respuesta de QA '+i);
 }
 await expect(page.locator('.qa-message')).toHaveCount(8);
 await input.fill('Borrador que debe conservarse al maximizar');
 await page.getByRole('button',{name:'Maximizar chat',exact:true}).click();
 const restoreSize=page.getByRole('button',{name:'Restaurar tamaño del chat',exact:true});
 await expect(restoreSize).toHaveAttribute('aria-pressed','true');
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:844});
  const bounds=await page.getByRole('dialog').boundingBox();
  expect(bounds).not.toBeNull();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width+1);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(845);
  expect(bounds!.width).toBeGreaterThanOrEqual(width-32);
  await expect(input).toHaveValue('Borrador que debe conservarse al maximizar');await expect(page.locator('.qa-message')).toHaveCount(8);
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  if(width!==390)await page.screenshot({path:testInfo.outputPath('lia-maximized-'+width+'.png')});
 }
 await restoreSize.click();await expect(page.getByRole('button',{name:'Maximizar chat',exact:true})).toHaveAttribute('aria-pressed','false');
 expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 await page.getByRole('button',{name:'Maximizar chat',exact:true}).click();await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Maximizar chat',exact:true})).toBeVisible();await expect(input).toHaveValue('Borrador que debe conservarse al maximizar');
 await page.getByRole('button',{name:'Maximizar chat',exact:true}).click();await page.getByRole('button',{name:'Cerrar asistente',exact:true}).click();
 await expect(page.getByRole('button',{name:'Abrir asistente MariBug'})).toBeFocused();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 await page.getByRole('button',{name:'Abrir asistente MariBug'}).click();await expect(input).toHaveValue('Borrador que debe conservarse al maximizar');
 await page.setViewportSize({width:390,height:844});
 await page.reload();await page.getByRole('button',{name:'Abrir asistente MariBug'}).click();
 await expect(page.locator('.qa-message')).toHaveCount(8);await expect(page.getByRole('log')).toContainText('Pregunta de QA 1');
 failArchive=true;await page.getByRole('button',{name:'Archivar',exact:true}).click();await expect(page.getByRole('dialog').getByRole('alert')).toContainText('No se pudo archivar');await expect(input).toBeEnabled();
 await page.getByRole('button',{name:'Archivar',exact:true}).click();await expect(input).toBeDisabled();await expect(page.getByRole('button',{name:'Restaurar',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Nueva',exact:false}).click();await expect(page.locator('.qa-message')).toHaveCount(0);
 await page.getByRole('button',{name:'Historial',exact:true}).click();await page.getByRole('button',{name:'Archivadas',exact:true}).click();
 await expect(page.locator('.qa-history-item')).toHaveCount(1);
 await page.screenshot({path:testInfo.outputPath('lia-history-mobile.png')});
 await page.locator('.qa-history-item').click();await expect(page.locator('.qa-message')).toHaveCount(8);
 await page.getByRole('button',{name:'Restaurar',exact:true}).click();await expect(input).toBeEnabled();
 await input.fill('Retomamos la conversación');await page.getByRole('button',{name:'Enviar pregunta'}).click();await expect(page.locator('.qa-message')).toHaveCount(10);
 await page.setViewportSize({width:1280,height:900});await page.screenshot({path:testInfo.outputPath('lia-conversation-desktop.png')});
 user='history-b';await page.reload();await page.getByRole('button',{name:'Abrir asistente MariBug'}).click();await expect(input).toBeEnabled();await expect(page.locator('.qa-message')).toHaveCount(0);
 await page.getByRole('button',{name:'Historial',exact:true}).click();await expect(page.locator('.qa-history-item')).toHaveCount(0);
});
