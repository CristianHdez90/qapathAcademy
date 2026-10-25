-- PostgreSQL: ejecutar TODO el archivo en una misma sesión de práctica.
-- Tablas temporales y ROLLBACK; no usa tablas de la academia.
BEGIN;
CREATE TEMP TABLE qa_training_customers(id integer PRIMARY KEY, name text, active boolean);
CREATE TEMP TABLE qa_training_orders(id integer PRIMARY KEY, customer_id integer REFERENCES qa_training_customers(id), status text, total integer);
INSERT INTO qa_training_customers VALUES(1,'Ana Demo',true),(2,'Luis Demo',false),(3,'Sol Demo',true);
INSERT INTO qa_training_orders VALUES(1,1,'paid',35000),(2,1,'pending',75000),(3,3,'paid',104500);
-- Q1 SELECT: tres clientes, ordenados 1,2,3.
SELECT id,name,active FROM qa_training_customers ORDER BY id;
-- Q2 WHERE + ORDER BY: pedidos pagados 3 (104500), 1 (35000).
SELECT id,total FROM qa_training_orders WHERE status='paid' ORDER BY total DESC,id;
-- Q3 INNER JOIN: tres filas: pedido 1 Ana, 2 Ana, 3 Sol.
SELECT o.id,c.name,o.status,o.total FROM qa_training_orders o
INNER JOIN qa_training_customers c ON c.id=o.customer_id ORDER BY o.id;
-- Q4 LEFT JOIN: cuatro filas; Luis aparece con pedido NULL.
SELECT c.id AS customer_id,c.name,o.id AS order_id FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id ORDER BY c.id,o.id;
-- Q5 Clientes sin pedidos: solo Luis (id 2). IS NULL, nunca = NULL.
SELECT c.id,c.name FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id WHERE o.id IS NULL ORDER BY c.id;
-- Q6 GROUP BY: paid -> 2, 139500; pending -> 1, 75000.
SELECT status,count(*) AS orders,sum(total) AS total FROM qa_training_orders GROUP BY status ORDER BY status;
-- Q7 Filtro en ON conserva al cliente sin pagos: Ana 35000, Luis 0, Sol 104500.
SELECT c.name,coalesce(sum(o.total),0) AS total_paid FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id AND o.status='paid' GROUP BY c.id,c.name ORDER BY c.id;
-- Q8 HAVING: solo Ana, 2 pedidos. COUNT(o.id) no cuenta el NULL de Luis.
SELECT c.id,c.name,count(o.id) AS orders FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id GROUP BY c.id,c.name HAVING count(o.id)>1 ORDER BY c.id;
-- Q9 EXISTS: clientes con algún pago: Ana y Sol.
SELECT c.id,c.name FROM qa_training_customers c WHERE EXISTS
(SELECT 1 FROM qa_training_orders o WHERE o.customer_id=c.id AND o.status='paid') ORDER BY c.id;
ROLLBACK;
-- Reto: mueve el filtro paid de ON a WHERE en Q7 y explica qué fila desaparece.
-- Entrega consulta, esperado previo, filas obtenidas y explicación de la diferencia.
