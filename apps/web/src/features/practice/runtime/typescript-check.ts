import * as ts from 'typescript';

export const typeLibraryNames=['lib.es5.d.ts','lib.es2015.core.d.ts','lib.es2015.iterable.d.ts','lib.es2015.symbol.d.ts','lib.decorators.d.ts','lib.decorators.legacy.d.ts'];
/** Check source only; student code is never evaluated in the compiler worker. */
export function checkTypeScript(source:string,libraries:Record<string,string>){
 const files:Record<string,string>={...Object.fromEntries(Object.entries(libraries).map(([name,text])=>['/'+name,text])),
  '/exercise.ts':source,
  '/sandbox.d.ts':"declare function assert(condition: unknown, message?: string): void;\ndeclare const console: { log(...values: unknown[]): void; error(...values: unknown[]): void; warn(...values: unknown[]): void };"};
 const options:ts.CompilerOptions={strict:true,noEmit:true,skipLibCheck:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None,types:[],lib:['lib.es5.d.ts','lib.es2015.core.d.ts','lib.es2015.iterable.d.ts']};
 const host:ts.CompilerHost={getSourceFile:(name,version)=>files[name]===undefined?undefined:ts.createSourceFile(name,files[name],version,true),getDefaultLibFileName:()=>'/lib.es5.d.ts',writeFile:()=>{},getCurrentDirectory:()=> '/',getDirectories:()=>[],fileExists:name=>files[name]!==undefined,readFile:name=>files[name],getCanonicalFileName:name=>name,useCaseSensitiveFileNames:()=>true,getNewLine:()=> '\n'};
 const program=ts.createProgram(['/exercise.ts','/sandbox.d.ts'],options,host);
 const errors=ts.getPreEmitDiagnostics(program).filter(item=>item.category===ts.DiagnosticCategory.Error);
 return {ok:errors.length===0,output:errors.length?errors.slice(0,8).map(item=>{const position=item.file&&item.start!==undefined?item.file.getLineAndCharacterOfPosition(item.start):undefined;return `TS${item.code}${position?' · línea '+(position.line+1)+', columna '+(position.character+1):''}: ${ts.flattenDiagnosticMessageText(item.messageText,' ')}`}).join('\n').slice(0,1200):'✓ Sin errores de tipos con strict. Chequeo estático; no se ejecutó el código.'};
}
