export function quote({price=35000,quantity,coupon='',shipping='pickup'}){
 if(!Number.isInteger(quantity)||quantity<1||quantity>5)throw new RangeError('Cantidad entre 1 y 5');
 if(!['pickup','delivery'].includes(shipping))throw new RangeError('Envío inválido');
 if(coupon!==''&&coupon!=='QA10')throw new RangeError('Cupón inválido');
 const subtotal=price*quantity;
 if(coupon==='QA10'&&subtotal<100000)throw new RangeError('Subtotal insuficiente');
 const discount=coupon==='QA10'?Math.round(subtotal*0.1):0;
 return {subtotal,discount,shipping:shipping==='delivery'?10000:0,total:subtotal-discount+(shipping==='delivery'?10000:0)};
}
