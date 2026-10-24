import {Body,Controller,Get,Header,Headers,Param,Post,Query,Res} from '@nestjs/common';
import {Public} from '../security/session-security';
import {practiceProducts,practiceQuote,practiceStatuses} from '../../application/practice-sandbox';

type PracticeResponse={status:(code:number)=>PracticeResponse;setHeader:(name:string,value:string)=>void;json:(value:unknown)=>unknown;end:()=>unknown};
@Public()
@Controller('practice')
export class PracticeController {
 @Get('products') @Header('X-QAPath-Sandbox','true')products(){return {sandbox:true,data:practiceProducts};}
 @Get('status/:code') @Header('X-QAPath-Sandbox','true')status(@Param('code')raw:string,@Res()res:PracticeResponse){
  res.setHeader('X-QAPath-Sandbox','true');
  const code=/^\d{3}$/.test(raw)?Number(raw):0;
  if(!practiceStatuses.includes(code))return res.status(400).json({sandbox:true,error:'Código no disponible en este simulador.'});
  if(code===401)res.setHeader('WWW-Authenticate','Bearer realm="qapath-practice"');
  if(code===429||code===503)res.setHeader('Retry-After','5');
  if(code===201)res.setHeader('Location','/api/v1/practice/products');
  if(code===204)return res.status(code).end();
  return res.status(code).json({sandbox:true,status:code,message:'Respuesta HTTP simulada para prácticas; no es un fallo de la academia.'});
 }
 @Get('access') @Header('X-QAPath-Sandbox','true')access(@Headers('authorization')authorization='',@Query('scope')scope='read',@Res()res:PracticeResponse){
  res.setHeader('X-QAPath-Sandbox','true');
  if(!['read','write'].includes(scope))return res.status(400).json({sandbox:true,error:'Scope válido: read o write.'});
  if(!['Bearer demo-reader','Bearer demo-admin'].includes(authorization)){
   res.setHeader('WWW-Authenticate','Bearer realm="qapath-practice"');
   return res.status(401).json({sandbox:true,error:'Usa un token de demostración: demo-reader o demo-admin. No envíes credenciales reales.'});
  }
  if(scope==='write'&&authorization==='Bearer demo-reader')return res.status(403).json({sandbox:true,error:'El rol ficticio reader no puede escribir.'});
  return res.status(200).json({sandbox:true,data:{scope,role:authorization==='Bearer demo-admin'?'admin':'reader'}});
 }
 @Post('quotes') @Header('X-QAPath-Sandbox','true')quote(@Body()body:unknown,@Res()res:PracticeResponse){
  res.setHeader('X-QAPath-Sandbox','true');
  const result=practiceQuote(body);
  return res.status(result.status).json({sandbox:true,...('data' in result?{data:result.data}:{error:result.error})});
 }
}
