-- Ejecutar completo en PostgreSQL de práctica. No modifica las tablas de la academia.
BEGIN;
CREATE TEMP TABLE qa_training_customers(id integer PRIMARY KEY, name text, active boolean);
CREATE TEMP TABLE qa_training_orders(id integer PRIMARY KEY, customer_id integer REFERENCES qa_training_customers(id), status text, total integer);
INSERT INTO qa_training_customers VALUES(1,'Ana Demo',true),(2,'Luis Demo',false),(3,'Sol Demo',true);
INSERT INTO qa_training_orders VALUES(1,1,'paid',35000),(2,1,'pending',75000),(3,3,'paid',104500);
SELECT status,count(*) AS orders,sum(total) AS total FROM qa_training_orders GROUP BY status ORDER BY status;
-- Esperado: paid -> 2 pedidos, 139500 COP; pending -> 1 pedido, 75000 COP.
SELECT c.name,coalesce(sum(o.total),0) AS total_paid FROM qa_training_customers c
LEFT JOIN qa_training_orders o ON o.customer_id=c.id AND o.status='paid' GROUP BY c.id,c.name ORDER BY c.id;
-- Esperado: Ana Demo 35000; Luis Demo 0; Sol Demo 104500.
ROLLBACK;
