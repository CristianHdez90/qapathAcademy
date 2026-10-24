import {Controller,Get} from '@nestjs/common';
import {Roles} from '../security/session-security';
@Controller('instructor')
@Roles('INSTRUCTOR','ADMIN')
export class InstructorController {
 @Get('status')status(){return {data:{contentManagementAccess:true}};}
}
