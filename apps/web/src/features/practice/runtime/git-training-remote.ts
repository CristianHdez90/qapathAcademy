import type LightningFS from '@isomorphic-git/lightning-fs';

export const trainingOrigin='qapath-local://origin';
async function copyObjects(fs:LightningFS,from:string,to:string):Promise<void>{
 try{await fs.promises.mkdir(to)}catch(error){if((error as {code?:string}).code!=='EEXIST')throw error}
 for(const name of await fs.promises.readdir(from)){
  const source=from+'/'+name,target=to+'/'+name;
  if((await fs.promises.stat(source)).isDirectory())await copyObjects(fs,source,target);
  else await fs.promises.writeFile(target,await fs.promises.readFile(source));
 }
}
export async function configureTrainingOrigin(fs:LightningFS){
 const git=await import('isomorphic-git');await fs.promises.stat('/repo/.git/HEAD');
 const base={fs,dir:'/repo'},existing=await git.getConfig({...base,path:'remote.origin.url'});
 if(existing&&existing!==trainingOrigin)throw Error('origin no corresponde al remoto local de entrenamiento. Reinicia este ejercicio.');
 if(!existing){await git.init({fs,dir:'/origin.git',gitdir:'/origin.git',bare:true,defaultBranch:'main'});await git.addRemote({...base,remote:'origin',url:trainingOrigin})}
 return existing?'origin ya estaba configurado como remoto local de entrenamiento.':'origin configurado: '+trainingOrigin+' · repositorio separado dentro del navegador.';
}
export async function requireTrainingOrigin(fs:LightningFS){
 const git=await import('isomorphic-git');
 if(await git.getConfig({fs,dir:'/repo',path:'remote.origin.url'})!==trainingOrigin)throw Error('Falta configurar origin. Ejecuta git remote add origin qapath-local://origin. No se realizó ninguna publicación.');
}
export async function publishTrainingBranch(fs:LightningFS,branch:string,editor:string){
 const git=await import('isomorphic-git'),base={fs,dir:'/repo'},remote={fs,dir:'/origin.git',gitdir:'/origin.git'};
 await requireTrainingOrigin(fs);
 const current=await git.currentBranch({...base,fullname:false});
 if(!branch||branch!==current)throw Error('La rama indicada no coincide con la rama actual '+current+'. Para continuar este desafío, vuelve a '+branch+' con git switch '+branch+'.');
 let head:string;try{head=await git.resolveRef({...base,ref:'refs/heads/'+branch})}catch{throw Error('La rama aún no tiene commits. Guarda, prepara y confirma el archivo antes de publicar.')}
 const working=await fs.promises.readFile('/repo/caso.md','utf8');
 const committed=new TextDecoder().decode((await git.readBlob({...base,oid:head,filepath:'caso.md'})).blob);
 if(working!==editor||committed!==editor||(await git.statusMatrix(base)).some(([,h,w,i])=>h!==w||w!==i))throw Error('El editor, el archivo guardado y el commit deben coincidir. Guarda, ejecuta git add y crea un nuevo commit antes del push.');
 let previous='';try{previous=await git.resolveRef({...remote,ref:'refs/heads/'+branch})}catch{/* First publication. */}
 if(previous&&previous!==head&&!await git.isDescendent({...base,oid:head,ancestor:previous}))throw Error('Publicación rechazada: la rama remota tiene cambios que debes integrar.');
 await copyObjects(fs,'/repo/.git/objects','/origin.git/objects');
 await git.writeRef({...remote,ref:'refs/heads/'+branch,value:head,force:true});
 await git.writeRef({...base,ref:'refs/remotes/origin/'+branch,value:head,force:true});
 const verified=await git.resolveRef({...remote,ref:'refs/heads/'+branch});
 const remoteContent=new TextDecoder().decode((await git.readBlob({...remote,oid:verified,filepath:'caso.md'})).blob);
 if(verified!==head||remoteContent!==editor)throw Error('La verificación del remoto no coincide con la entrega local.');
 return (previous===head?'Everything up-to-date.':'Rama '+branch+' actualizada en origin de entrenamiento.')+'\nCommit local: '+head+'\nCommit en origin/'+branch+': '+verified+'\nArchivo local y remoto: coinciden.\nPublicación de entrenamiento verificada; no se envió nada a GitHub.';
}
export async function fetchTrainingMain(fs:LightningFS){
 const git=await import('isomorphic-git');await requireTrainingOrigin(fs);
 let head:string;try{head=await git.resolveRef({fs,dir:'/origin.git',gitdir:'/origin.git',ref:'refs/heads/main'})}catch{throw Error('origin todavía no tiene la rama main. Primero publica un commit de main en el remoto de entrenamiento.')}
 await copyObjects(fs,'/origin.git/objects','/repo/.git/objects');
 await git.writeRef({fs,dir:'/repo',ref:'refs/remotes/origin/main',value:head,force:true});
 return 'Referencia origin/main actualizada: '+head+'\nLa rama local y el archivo de trabajo no se modificaron.';
}
