/** Only the private learning-path destination is allowed; never accepts arbitrary redirect URLs. */
export function safeLearningPathReturn(value:unknown):string|undefined{
 return typeof value==='string'&&/^\/learning-paths(?:\?add=[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})?$/i.test(value)?value:undefined;
}
