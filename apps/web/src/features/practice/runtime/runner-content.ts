export type RunnerMode='scenario'|'http'|'sql'|'code'|'pipeline'|'git'|'topic';
export function runnerModes(week:number):RunnerMode[]{
 if(week<=6)return ['scenario'];if(week===7)return ['http'];if(week===8)return ['sql'];if(week<=12)return ['code'];
 if(week<=18)return ['scenario'];if(week===19)return ['http'];if(week===20)return ['scenario'];if(week<=22)return ['pipeline'];return ['scenario','http','sql','code','pipeline'];
}
export const sqlExamples={
 'SELECT y filtros':"SELECT id,total FROM qa_training_orders WHERE status='paid' ORDER BY total DESC;",
 'INNER JOIN':"SELECT o.id,c.name,o.total FROM qa_training_orders o INNER JOIN qa_training_customers c ON c.id=o.customer_id ORDER BY o.id;",
 'LEFT JOIN':"SELECT c.name,o.id AS order_id FROM qa_training_customers c LEFT JOIN qa_training_orders o ON o.customer_id=c.id ORDER BY c.id,o.id;",
 'Sin pedidos':"SELECT c.name FROM qa_training_customers c LEFT JOIN qa_training_orders o ON o.customer_id=c.id WHERE o.id IS NULL;",
 'GROUP BY y HAVING':"SELECT customer_id,COUNT(*) AS orders FROM qa_training_orders GROUP BY customer_id HAVING COUNT(*)>1;",
 'Productos por pedido':"SELECT o.id AS order_id,p.name,i.quantity,i.unit_price,i.quantity*i.unit_price AS subtotal FROM qa_training_orders o INNER JOIN qa_training_order_items i ON i.order_id=o.id INNER JOIN qa_training_products p ON p.id=i.product_id ORDER BY o.id,i.id;",
 'Ventas por producto':"SELECT p.name,SUM(i.quantity) AS units,SUM(i.quantity*i.unit_price) AS sales FROM qa_training_products p INNER JOIN qa_training_order_items i ON i.product_id=p.id INNER JOIN qa_training_orders o ON o.id=i.order_id WHERE o.status='paid' GROUP BY p.id,p.name ORDER BY sales DESC;",
 'Conciliar totales':"SELECT o.id,o.total,SUM(i.quantity*i.unit_price) AS calculated_total FROM qa_training_orders o INNER JOIN qa_training_order_items i ON i.order_id=o.id GROUP BY o.id,o.total HAVING o.total<>SUM(i.quantity*i.unit_price);",
 'Consulta libre':"-- Escribe tu consulta usando las tablas y columnas de la pista.\nSELECT * FROM qa_training_products ORDER BY price DESC;"
};
export function initialCode(week:number){
 if(week===10)return `const results=[{id:'TC-01',status:'passed'},{id:'TC-02',status:'failed'},{id:'TC-03',status:'blocked'}];\nconst passed=results.filter(r=>r.status==='passed').length;\nassert(passed===1,'Una prueba aprobada');\nconsole.log({passed,total:results.length});`;
 if(week===11)return `interface QuoteResult {total:number;currency:'COP'}\nfunction valid(value:unknown):value is QuoteResult {\n return typeof value==='object'&&value!==null&&'total' in value&&typeof value.total==='number'&&'currency' in value&&value.currency==='COP';\n}\nassert(valid({total:35000,currency:'COP'}),'Contrato válido');\nassert(!valid({total:'35000',currency:'COP'}),'Rechaza total de texto');`;
 if(week===12)return `async function fetchDemo(status){return {ok:status===200,status,json:async()=>({total:35000})}}\nasync function read(status){const response=await fetchDemo(status);if(!response.ok)throw new Error('HTTP '+response.status);return await response.json()}\nassert((await read(200)).total===35000,'Éxito asíncrono');\ntry{await read(503);assert(false,'Debe rechazar 503')}catch(error){assert(error.message==='HTTP 503','Error HTTP diferenciado')}\n// fetchDemo es un doble de prueba local configurable.`;
 return `function total(quantity,coupon='',shipping='pickup'){\n if(!Number.isInteger(quantity)||quantity<1||quantity>5)throw new RangeError('Cantidad inválida');\n const subtotal=35000*quantity;\n if(coupon==='QA10'&&subtotal<100000)throw new RangeError('Subtotal insuficiente');\n return subtotal-(coupon==='QA10'?Math.round(subtotal*.1):0)+(shipping==='delivery'?10000:0);\n}\nassert(total(1)===35000,'Cotización básica');\nassert(total(3,'QA10','delivery')===104500,'Descuento sin afectar envío');\nconsole.log('Añade tus casos de límites e inválidos');`;
}
