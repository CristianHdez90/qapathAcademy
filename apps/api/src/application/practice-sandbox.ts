/** Stateless training fixtures. Never reads accounts, orders or application secrets. */
export const practiceProducts=[
 {id:'basic',name:'Curso básico',price:35000,available:true},
 {id:'pro',name:'Curso profesional',price:75000,available:true},
 {id:'sold-out',name:'Taller sin cupos',price:50000,available:false},
];
export const practiceStatuses=[200,201,202,204,400,401,403,404,409,422,429,500,503];
export function practiceQuote(input:unknown){
 if(!input||typeof input!=='object'||Array.isArray(input))return {status:400,error:'Envía un objeto JSON.'} as const;
 const value=input as Record<string,unknown>;
 if(Object.keys(value).some(key=>!['productId','quantity','coupon','shipping'].includes(key))||typeof value.productId!=='string'||typeof value.quantity!=='number'||typeof value.shipping!=='string'||(value.coupon!==undefined&&typeof value.coupon!=='string'))return {status:400,error:'Campos requeridos: productId (texto), quantity (número), shipping (pickup o delivery), coupon opcional.'} as const;
 const product=practiceProducts.find(item=>item.id===value.productId);
 if(!product)return {status:404,error:'Producto ficticio no encontrado.'} as const;
 if(!product.available)return {status:409,error:'El producto ficticio no tiene cupos.'} as const;
 if(!Number.isInteger(value.quantity)||value.quantity<1||value.quantity>5||!['pickup','delivery'].includes(value.shipping))return {status:422,error:'Cantidad entera entre 1 y 5; envío pickup o delivery.'} as const;
 const coupon=value.coupon||'';
 if(coupon!==''&&coupon!=='QA10')return {status:422,error:'Cupón ficticio inválido.'} as const;
 const subtotal=product.price*value.quantity;
 if(coupon==='QA10'&&subtotal<100000)return {status:422,error:'QA10 requiere un subtotal mínimo de 100000 COP.'} as const;
 const discount=coupon==='QA10'?Math.round(subtotal*0.1):0;
 const shipping=value.shipping==='delivery'?10000:0;
 return {status:200,data:{productId:product.id,quantity:value.quantity,subtotal,discount,shipping,total:subtotal-discount+shipping,currency:'COP'}} as const;
}
