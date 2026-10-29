/**
 * Diagnóstico LOCAL de la cadena de correo Firebase (API → Firestore `mail` → Cloud Function → SMTP).
 * Uso desde la raíz:  pnpm mail:check correo@destino.com
 * Escribe un documento de prueba SIN enlaces ni tokens y espera hasta 60 s el campo delivery.state.
 * Nunca imprime credenciales, claves ni URLs SMTP.
 */
import {existsSync,readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const envFile=join(dirname(fileURLToPath(import.meta.url)),'..','.env');
if(existsSync(envFile))process.loadEnvFile(envFile);
const to=(process.argv[2]||'').trim();
const step=(ok,text)=>console.log(`${ok?'✔':'✖'} ${text}`);
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)){console.error('Indica el correo destino: pnpm mail:check correo@destino.com');process.exit(2)}
const transport=(process.env.EMAIL_TRANSPORT||'resend').toLowerCase();
step(transport==='firebase',`EMAIL_TRANSPORT efectivo = ${transport}${transport==='firebase'?'':' (la API no usa Firebase; si hay dos líneas EMAIL_TRANSPORT en .env gana la última)'}`);
const projectId=process.env.FIREBASE_PROJECT_ID?.trim();step(!!projectId,`FIREBASE_PROJECT_ID ${projectId?'= '+projectId:'no configurado'}`);
const credentials=process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
if(credentials){
 const exists=existsSync(credentials);step(exists,`Archivo de credenciales ${exists?'encontrado':'NO encontrado en la ruta de GOOGLE_APPLICATION_CREDENTIALS'}`);
 if(!exists)process.exit(1);
 try{const json=JSON.parse(readFileSync(credentials,'utf8'));step(json.project_id===projectId,`project_id del JSON ${json.project_id===projectId?'coincide':'= '+json.project_id+' y NO coincide'} con FIREBASE_PROJECT_ID`);}
 catch{step(false,'El archivo de credenciales no es un JSON válido');process.exit(1)}
}else step(!!(process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY),'Credenciales explícitas FIREBASE_SERVICE_ACCOUNT_EMAIL + FIREBASE_PRIVATE_KEY');
if(!projectId)process.exit(1);
const {applicationDefault,cert,initializeApp}=await import('firebase-admin/app');
const {getFirestore}=await import('firebase-admin/firestore');
const app=initializeApp({projectId,credential:credentials?applicationDefault():cert({projectId,clientEmail:process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n')})},'qapath-mail-check');
const collection=process.env.FIREBASE_MAIL_COLLECTION?.trim()||'mail';
let ref;
try{
 ref=await getFirestore(app).collection(collection).add({to,message:{subject:'Prueba de entrega — QAPath Academy',text:'Mensaje de diagnóstico local. No contiene enlaces ni tokens.'},expireAt:new Date(Date.now()+48*3600e3)});
 step(true,`Documento escrito en Firestore: ${collection}/${ref.id}`);
}catch(error){step(false,`No se pudo escribir en Firestore (${error.code||error.name}): ${String(error.message).split('\n')[0]}`);console.log('  → Esto produce el «Error HTTP 500» al registrarse. Revisa permisos IAM de la cuenta de servicio y que exista la base Firestore (default).');process.exit(1)}
console.log('  Esperando a la Cloud Function (hasta 60 s)…');
for(let i=0;i<30;i++){
 await new Promise(r=>setTimeout(r,2000));
 const delivery=(await ref.get()).get('delivery');
 if(delivery?.state==='SUCCESS'){step(true,'delivery.state = SUCCESS: el SMTP aceptó el mensaje. Si no llega, revisa spam/promociones y el remitente QAPATH_SMTP_FROM.');process.exit(0)}
 if(delivery?.state==='ERROR'){step(false,`delivery.state = ERROR${delivery.error?': '+String(delivery.error).slice(0,200):''}`);console.log('  → Revisa los secretos QAPATH_SMTP_URL / QAPATH_SMTP_FROM y los logs: npx firebase-tools functions:log --project '+projectId);process.exit(1)}
}
step(false,'Sin campo delivery tras 60 s: la Cloud Function qapath-mail no está desplegada en este proyecto o no escucha esta colección.');
console.log('  → Despliega la función (docs/FIREBASE_EMAIL_V61.md §2) o usa EMAIL_TRANSPORT=console para desarrollo local.');
process.exit(1);
