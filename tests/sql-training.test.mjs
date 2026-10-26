import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const {tables}=JSON.parse(readFileSync(new URL('../apps/web/public/practice/kit/data/training-data.json',import.meta.url),'utf8'));
const seed=readFileSync(new URL('../apps/web/public/practice/kit/data/training.sql',import.meta.url),'utf8');
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');
test('SQL hint records and relationships match executable PostgreSQL and order totals',async()=>{
 const db=new PGlite();try{await db.exec(seed.split('-- Q1')[0]);
 for(const table of tables){const result=await db.query(`SELECT * FROM ${table.name} ORDER BY id`);assert.deepEqual(result.fields.map(f=>f.name),table.columns.map(c=>c.name));assert.deepEqual(result.rows,table.rows);for(const column of table.columns.filter(c=>c.references)){const fk=await db.query(`SELECT COUNT(*)::integer AS count FROM ${table.name} child LEFT JOIN ${column.references.table} parent ON parent.${column.references.column}=child.${column.name} WHERE parent.${column.references.column} IS NULL`);assert.equal(fk.rows[0].count,0)}}
 const totals=await db.query('SELECT o.id FROM qa_training_orders o JOIN qa_training_order_items i ON i.order_id=o.id GROUP BY o.id,o.total HAVING o.total<>SUM(i.quantity*i.unit_price)');assert.deepEqual(totals.rows,[]);
 const missing=await db.query('SELECT c.name FROM qa_training_customers c LEFT JOIN qa_training_orders o ON o.customer_id=c.id WHERE o.id IS NULL ORDER BY c.id');assert.deepEqual(missing.rows.map(r=>r.name),['Luis Demo','Eva Demo']);
 const counts=await db.query("SELECT status,COUNT(*)::integer AS count FROM qa_training_orders GROUP BY status");assert.equal(counts.rows.length,5);assert.equal(counts.rows.find(r=>r.status==='paid').count,6);
 }finally{await db.close()}
});
