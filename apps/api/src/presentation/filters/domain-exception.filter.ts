import {ArgumentsHost,Catch,ExceptionFilter,HttpStatus} from '@nestjs/common';
import {NotFoundError,ValidationError} from '@qapath/learning';
@Catch(NotFoundError,ValidationError)
export class DomainExceptionFilter implements ExceptionFilter {
 catch(exception:NotFoundError|ValidationError,host:ArgumentsHost){
  const response=host.switchToHttp().getResponse<{status:(code:number)=>{json:(payload:unknown)=>void}}>();
  const status=exception instanceof NotFoundError?HttpStatus.NOT_FOUND:HttpStatus.UNPROCESSABLE_ENTITY;
  response.status(status).json({error:{code:exception.code,message:exception.message}});
 }
}
