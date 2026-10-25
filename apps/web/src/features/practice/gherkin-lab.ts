export type GherkinChoice={id:string;role:'Given'|'When'|'Then';text:string;active?:boolean;valid?:boolean;action?:'access'|'password';outcome?:'allow'|'credentials'|'inactive';observable?:boolean};
export const gherkinStory={id:'HU-AC-01',as:'cliente registrado',want:'acceder a mis pedidos con mi cuenta',so:'consultar mis compras de forma segura',criteria:[
 'CA-01: Una cuenta activa con credenciales correctas accede al panel Mis pedidos.',
 'CA-02: En una cuenta activa, las credenciales incorrectas impiden el acceso y muestran el mensaje Credenciales incorrectas.',
 'CA-03: Una cuenta inactiva no accede, incluso con credenciales correctas, y muestra Cuenta inactiva.'
]};
export const gherkinChoices:GherkinChoice[]=[
 {id:'active-valid',role:'Given',text:'tengo una cuenta activa con credenciales correctas',active:true,valid:true},
 {id:'active-invalid',role:'Given',text:'tengo una cuenta activa con credenciales incorrectas',active:true,valid:false},
 {id:'inactive-valid',role:'Given',text:'tengo una cuenta inactiva con credenciales correctas',active:false,valid:true},
 {id:'inactive-invalid',role:'Given',text:'tengo una cuenta inactiva con credenciales incorrectas',active:false,valid:false},
 {id:'request-access',role:'When',text:'solicito acceder a mis pedidos',action:'access'},
 {id:'request-password',role:'When',text:'solicito restablecer mi contraseña',action:'password'},
 {id:'show-orders',role:'Then',text:'veo el panel Mis pedidos',outcome:'allow',observable:true},
 {id:'invalid-credentials',role:'Then',text:'veo el mensaje Credenciales incorrectas y no accedo a mis pedidos',outcome:'credentials',observable:true},
 {id:'inactive-account',role:'Then',text:'veo el mensaje Cuenta inactiva y no accedo a mis pedidos',outcome:'inactive',observable:true},
 {id:'ambiguous',role:'Then',text:'todo funciona correctamente',observable:false}
];
export const gherkinScenarioTitles=[
 'Acceder a mis pedidos con una cuenta activa',
 'Rechazar acceso con credenciales incorrectas',
 'Rechazar acceso con una cuenta inactiva',
 'Rechazar acceso con cuenta inactiva y credenciales incorrectas'
] as const;
export type GherkinSelection={title:string;given:string;when:string;then:string};
export const gherkinExample:GherkinSelection={title:'Acceder a mis pedidos con una cuenta activa',given:'active-valid',when:'request-access',then:'show-orders'};
export const emptyGherkinSelection=():GherkinSelection=>({title:'',given:'',when:'',then:''});
export function readGherkinSelection(source:string):GherkinSelection|null{
 try{const data=JSON.parse(source);if(data.gherkinVersion!==1||!['title','given','when','then'].every(key=>typeof data[key]==='string'&&data[key].length<=120))return null;return {title:data.title,given:data.given,when:data.when,then:data.then}}catch{return null}
}
export function gherkinCriterion(selection:GherkinSelection){const given=gherkinChoices.find(choice=>choice.id===selection.given);return given?.role!=='Given'?null:given.active?(given.valid?'CA-01':'CA-02'):'CA-03'}
export function buildGherkinFeature(selection:GherkinSelection){
 const step=(role:'Given'|'When'|'Then',id:string)=>{const choice=gherkinChoices.find(c=>c.id===id);return choice?`    ${role} ${choice.text}`:`    # Selecciona el ${role}`};
 return `Feature: Acceso a mis pedidos\n  Como ${gherkinStory.as}\n  Quiero ${gherkinStory.want}\n  Para ${gherkinStory.so}\n\n  Scenario: ${selection.title.replace(/[\r\n]/g,' ').trim()||'Define un comportamiento concreto'}\n${step('Given',selection.given)}\n${step('When',selection.when)}\n${step('Then',selection.then)}\n`;
}
export function validateGherkinSelection(selection:GherkinSelection){
 const errors:string[]=[];if(selection.title.trim().length<8||selection.title.length>120||/[\r\n]/.test(selection.title))errors.push('Scenario: escribe un título de 8 a 120 caracteres que identifique el comportamiento.');
 const given=gherkinChoices.find(c=>c.id===selection.given),when=gherkinChoices.find(c=>c.id===selection.when),then=gherkinChoices.find(c=>c.id===selection.then);
 for(const [role,choice] of [['Given',given],['When',when],['Then',then]] as const){if(!choice)errors.push(`${role}: selecciona una opción.`);else if(choice.role!==role)errors.push(`${role}: elegiste un ${choice.role}. Usa ${role==='Given'?'un contexto inicial, no una acción ni un resultado':role==='When'?'la acción que desencadena el comportamiento':'un resultado observable, no un contexto ni una acción'}.`)}
 if(when?.role==='When'&&when.action!=='access')errors.push('When: restablecer la contraseña pertenece a otra historia; esta HU trata del acceso a mis pedidos.');
 if(then?.role==='Then'&&!then.observable)errors.push('Then: «todo funciona correctamente» no es comprobable. Indica un panel visible o un mensaje y la ausencia de acceso.');
 let observed='Sin ejecución: completa contexto, acción y resultado.';
 if(given?.role==='Given'&&when?.role==='When'&&when.action==='access'){
  const outcome=!given.active?'inactive':!given.valid?'credentials':'allow';
  observed=outcome==='allow'?'Panel Mis pedidos visible.':outcome==='inactive'?'Mensaje Cuenta inactiva; panel Mis pedidos no accesible.':'Mensaje Credenciales incorrectas; panel Mis pedidos no accesible.';
  if(then?.role==='Then'&&then.observable&&then.outcome!==outcome)errors.push(`Then: contradice ${outcome==='allow'?'CA-01':outcome==='credentials'?'CA-02':'CA-03'}. Resultado obtenido: ${observed}`);
 }
 return {ok:errors.length===0,errors,observed};
}
