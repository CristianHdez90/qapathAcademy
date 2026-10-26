-- PostgreSQL: ejecutar TODO el archivo en una misma sesión de práctica.
-- Datos ficticios. Tablas temporales y ROLLBACK; no usa tablas de la academia.
-- Generado desde training-data.json mediante scripts/generate-sql-training.mjs.
BEGIN;
CREATE TEMP TABLE qa_training_customers(id integer PRIMARY KEY, name text, active boolean);
INSERT INTO qa_training_customers VALUES
(1,'Ana Demo',true),
(2,'Luis Demo',false),
(3,'Sol Demo',true),
(4,'Diego Demo',true),
(5,'Mía Demo',true),
(6,'Leo Demo',false),
(7,'Sara Demo',true),
(8,'Eva Demo',true);
CREATE TEMP TABLE qa_training_products(id integer PRIMARY KEY, name text, price integer, active boolean);
INSERT INTO qa_training_products VALUES
(1,'Curso básico QA',35000,true),
(2,'Curso profesional QA',75000,true),
(3,'Curso SQL',50000,true),
(4,'Licencia de práctica',10000,false),
(5,'Taller DevTools',20000,true),
(6,'Kit API',29500,true);
CREATE TEMP TABLE qa_training_orders(id integer PRIMARY KEY, customer_id integer REFERENCES qa_training_customers(id), status text, total integer);
INSERT INTO qa_training_orders VALUES
(1,1,'paid',35000),
(2,1,'pending',75000),
(3,3,'paid',104500),
(4,4,'pending',50000),
(5,5,'paid',70000),
(6,1,'cancelled',10000),
(7,6,'paid',75000),
(8,4,'shipped',29500),
(9,7,'refunded',20000),
(10,3,'paid',100000),
(11,5,'pending',45000),
(12,6,'paid',35000);
CREATE TEMP TABLE qa_training_order_items(id integer PRIMARY KEY, order_id integer REFERENCES qa_training_orders(id), product_id integer REFERENCES qa_training_products(id), quantity integer, unit_price integer);
INSERT INTO qa_training_order_items VALUES
(1,1,1,1,35000),
(2,2,2,1,75000),
(3,3,2,1,75000),
(4,3,6,1,29500),
(5,4,3,1,50000),
(6,5,1,2,35000),
(7,6,4,1,10000),
(8,7,2,1,75000),
(9,8,6,1,29500),
(10,9,5,1,20000),
(11,10,3,2,50000),
(12,11,1,1,35000),
(13,11,4,1,10000),
(14,12,1,1,35000);
-- Q1 SELECT: ocho clientes.
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
