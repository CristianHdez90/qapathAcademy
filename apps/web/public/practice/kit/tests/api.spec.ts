import {test,expect} from '@playwright/test';
test('catálogo de práctica @smoke',async({request})=>{
 const response=await request.get('/api/v1/practice/products');expect(response.status()).toBe(200);
 const body=await response.json();expect(body.sandbox).toBe(true);expect(body.data).toHaveLength(3);
});
test('el cupón excluye el costo de envío',async({request})=>{
 const response=await request.post('/api/v1/practice/quotes',{data:{productId:'basic',quantity:3,coupon:'QA10',shipping:'delivery'}});
 expect(response.status()).toBe(200);expect((await response.json()).data.total).toBe(104500);
});
for(const code of [200,201,204,400,401,403,404,409,422,429,500,503])test(`HTTP ${code}`,async({request})=>{
 const response=await request.get(`/api/v1/practice/status/${code}`);expect(response.status()).toBe(code);
 if(code===204)expect(await response.text()).toBe('');else expect((await response.json()).sandbox).toBe(true);
});
