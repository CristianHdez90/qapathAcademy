import test from 'node:test';
import assert from 'node:assert/strict';
import {quote} from './pricing.mjs';
test('el descuento no afecta al envío',()=>assert.equal(quote({quantity:3,coupon:'QA10',shipping:'delivery'}).total,104500));
test('cantidad mínima y máxima',()=>{assert.equal(quote({quantity:1}).total,35000);assert.equal(quote({quantity:5}).total,175000)});
test('rechaza cero y fracciones',()=>{assert.throws(()=>quote({quantity:0}));assert.throws(()=>quote({quantity:1.5}))});
test('rechaza cupón bajo el mínimo',()=>assert.throws(()=>quote({quantity:2,coupon:'QA10'})));
