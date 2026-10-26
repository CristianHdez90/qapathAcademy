export type SqlResult={columns:string[];rows:Record<string,unknown>[];rowCount:number;limit:number;truncated?:boolean};
export function readSqlResult(output:string):SqlResult|null{
 try{const data=JSON.parse(output);if(!data||!Array.isArray(data.columns)||!data.columns.every((x:unknown)=>typeof x==='string')||!Array.isArray(data.rows)||data.rows.length>100||!data.rows.every((x:unknown)=>x!==null&&typeof x==='object'&&!Array.isArray(x))||!Number.isInteger(data.rowCount)||data.rowCount<data.rows.length||!Number.isInteger(data.limit)||data.limit<0||data.limit>100)return null;return {columns:data.columns,rows:data.rows,rowCount:data.rowCount,limit:data.limit,...(data.truncated?{truncated:true}:{})};}catch{return null}
}
/** Keep a valid relational preview even when saved evidence has a smaller size budget. */
export function fitSqlOutput(output:string,max:number):string{
 const data=readSqlResult(output);if(!data)return output.slice(0,max);let text=JSON.stringify(data);
 while(text.length>max&&data.rows.length){data.rows.pop();data.truncated=true;text=JSON.stringify(data);}
 return text.length<=max?text:JSON.stringify({columns:[],rows:[],rowCount:data.rowCount,limit:0,truncated:true});
}
export function sqlCell(value:unknown):string{if(value===null||value===undefined)return 'NULL';return typeof value==='object'?JSON.stringify(value):String(value)}
export function sqlCsv(result:SqlResult):string{
 const quote=(value:unknown)=>{let text=value===null||value===undefined?'':sqlCell(value);if(typeof value==='string'&&/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'};
 return [result.columns.map(quote).join(','),...result.rows.map(row=>result.columns.map(column=>quote(row[column])).join(','))].join('\r\n');
}
