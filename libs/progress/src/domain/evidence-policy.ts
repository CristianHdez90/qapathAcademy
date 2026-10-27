const extendedExercises=new Set(['1','5','7','8','9','23','24']);

/** Maximum serialized evidence length in UTF-16 units; identifiers are validated separately. */
export function evidenceTextLimit(kind:string,id:string):number{
 return kind==='exercise'&&extendedExercises.has(id)?32000:8000;
}
