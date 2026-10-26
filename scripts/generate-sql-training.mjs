import {readFileSync,writeFileSync} from 'node:fs';
const dataUrl=new URL('../apps/web/public/practice/kit/data/training-data.json',import.meta.url);
const {tables}=JSON.parse(readFileSync(dataUrl,'utf8'));
const literal=value=>value===null?'NULL':typeof value==='string'?"'"+value.replaceAll("'","''")+"'":String(value);
const seed=tables.map(table=>`CREATE TEMP TABLE ${table.name}(${table.columns.map(c=>`${c.name} ${c.type}${c.primaryKey?' PRIMARY KEY':''}${c.references?` REFERENCES ${c.references.table}(${c.references.column})`:''}`).join(', ')});\nINSERT INTO ${table.name} VALUES\n${table.rows.map(row=>'('+table.columns.map(c=>literal(row[c.name])).join(',')+')').join(',\n')};`).join('\n');
const examples=`-- Q1 SELECT: ocho clientes.
SELECT id,name,active FROM qa_training_customers ORDER BY id;
-- Q2 WHERE + ORDER BY: seis pedidos pagados.
SELECT id,total FROM qa_training_orders WHERE status='paid' ORDER BY total DESC,id;
-- Q3 INNER JOIN: doce pedidos con sus clientes.
SELECT o.id,c.name,o.status,o.total FROM qa_training_orders o
INNER JOIN qa_training_customers c ON c.id=o.customer_id ORDER BY o.id;
-- Q4 LEFT JOIN: catorce filas; Luis y Eva tienen pedido NULL.
SELECT c.id AS customer_id,c.name,o.id AS order_id FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id ORDER BY c.id,o.id;
-- Q5 Clientes sin pedidos: Luis y Eva. IS NULL, nunca = NULL.
SELECT c.id,c.name FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id WHERE o.id IS NULL ORDER BY c.id;
-- Q6 GROUP BY: suma y cantidad por estado.
SELECT status,count(*) AS orders,sum(total) AS total FROM qa_training_orders GROUP BY status ORDER BY status;
-- Q7 Filtro en ON conserva a clientes sin pagos, con total 0.
SELECT c.name,coalesce(sum(o.total),0) AS total_paid FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id AND o.status='paid' GROUP BY c.id,c.name ORDER BY c.id;
-- Q8 HAVING: clientes con más de un pedido. COUNT(o.id) no cuenta NULL.
SELECT c.id,c.name,count(o.id) AS orders FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id GROUP BY c.id,c.name HAVING count(o.id)>1 ORDER BY c.id;
-- Q9 EXISTS: clientes con algún pago.
SELECT c.id,c.name FROM qa_training_customers c WHERE EXISTS
(SELECT 1 FROM qa_training_orders o WHERE o.customer_id=c.id AND o.status='paid') ORDER BY c.id;
-- Q10 Tres tablas: detalle con nombre del producto y subtotal por línea.
SELECT o.id AS order_id,p.name,i.quantity,i.unit_price,i.quantity*i.unit_price AS subtotal
FROM qa_training_orders o INNER JOIN qa_training_order_items i ON i.order_id=o.id
INNER JOIN qa_training_products p ON p.id=i.product_id ORDER BY o.id,i.id;
-- Q11 Conciliación: ninguna fila si los totales son correctos.
SELECT o.id,o.total,sum(i.quantity*i.unit_price) AS calculated_total
FROM qa_training_orders o INNER JOIN qa_training_order_items i ON i.order_id=o.id
GROUP BY o.id,o.total HAVING o.total<>sum(i.quantity*i.unit_price);
ROLLBACK;
-- Reto: mueve el filtro paid de ON a WHERE en Q7 y explica qué clientes desaparecen.
-- Entrega consulta, resultado esperado, resultado obtenido y explicación de la diferencia.
`;
const sql='-- PostgreSQL: ejecutar TODO el archivo en una misma sesión de práctica.\n-- Datos ficticios. Tablas temporales y ROLLBACK; no usa tablas de la academia.\n-- Generado desde training-data.json mediante scripts/generate-sql-training.mjs.\nBEGIN;\n'+seed+'\n'+examples;
writeFileSync(new URL('../apps/web/public/practice/kit/data/training.sql',import.meta.url),sql);
const contentUrl=new URL('../libs/content/src/data/practical-exercises.json',import.meta.url);
const content=JSON.parse(readFileSync(contentUrl,'utf8'));content[8].starter.code=sql;
content[7].steps.forEach(step=>{step.expected=step.expected.replace('INNER JOIN devuelve tres pedidos','INNER JOIN devuelve doce pedidos')});
content[8].steps.forEach(step=>{step.expected=step.expected.replace('La consulta inicial INNER JOIN devuelve tres pedidos: dos de Ana y uno de Sol','La consulta inicial INNER JOIN devuelve doce pedidos con sus clientes').replace('Q1 devuelve tres clientes; Q2 devuelve los pedidos pagados 3 (104500) y 1 (35000), ordenados por total descendente.','Q1 devuelve ocho clientes; Q2 devuelve seis pedidos pagados, ordenados por total descendente.').replace('INNER JOIN devuelve tres pedidos; LEFT JOIN conserva cuatro filas, incluida Luis con pedido NULL; el anti-join devuelve solo Luis.','INNER JOIN devuelve doce pedidos; LEFT JOIN conserva catorce filas, incluidos Luis y Eva con pedido NULL; el anti-join devuelve a Luis y Eva.')});
const updatedExpectations=[
 ['paid tiene 2 pedidos y 139500 COP; pending tiene 1 y 75000 COP.','paid tiene 6 pedidos y 419500 COP; pending tiene 3 y 170000 COP.'],
 ['Ana Demo 35000, Luis Demo 0 y Sol Demo 104500. INNER JOIN excluye al cliente sin pago.','Ana Demo 35000, Luis Demo 0, Sol Demo 204500, Diego Demo 0, Mía Demo 70000, Leo Demo 110000, Sara Demo 0 y Eva Demo 0. INNER JOIN excluye a clientes sin pago.'],
 ['HAVING devuelve Ana con dos pedidos; EXISTS devuelve Ana y Sol. El filtro en WHERE elimina a Luis; en ON lo conserva con total cero.','HAVING devuelve Ana con tres pedidos, y Sol, Diego, Mía y Leo con dos. EXISTS devuelve Ana, Sol, Mía y Leo. El filtro en WHERE excluye a clientes sin pagos; en ON los conserva con total cero.']
];
for(const step of content[8].steps)for(const [before,after] of updatedExpectations)step.expected=step.expected.replaceAll(before,after);
writeFileSync(contentUrl,JSON.stringify(content,null,2)+'\n');
for(const week of [7,8]){
 const guideUrl=new URL(`../apps/web/public/practice/kit/guides/week-${String(week).padStart(2,'0')}.md`,import.meta.url);
 let guide=readFileSync(guideUrl,'utf8');
 for(const [before,after] of [
  ['INNER JOIN devuelve tres pedidos','INNER JOIN devuelve doce pedidos'],
  ['La consulta inicial INNER JOIN devuelve tres pedidos: dos de Ana y uno de Sol','La consulta inicial INNER JOIN devuelve doce pedidos con sus clientes'],
  ['Q1 devuelve tres clientes; Q2 devuelve los pedidos pagados 3 (104500) y 1 (35000), ordenados por total descendente.','Q1 devuelve ocho clientes; Q2 devuelve seis pedidos pagados, ordenados por total descendente.'],
  ['LEFT JOIN conserva cuatro filas, incluida Luis con pedido NULL; el anti-join devuelve solo Luis.','LEFT JOIN conserva catorce filas, incluidos Luis y Eva con pedido NULL; el anti-join devuelve a Luis y Eva.']
 ,...updatedExpectations])guide=guide.replaceAll(before,after);
 writeFileSync(guideUrl,guide);
}
