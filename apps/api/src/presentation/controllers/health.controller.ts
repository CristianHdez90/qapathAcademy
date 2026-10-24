import {Public} from '../security/session-security';
import {Controller,Get} from '@nestjs/common';
@Controller('health')
@Public()
export class HealthController {
 @Get()getHealth(){return {data:{status:'ok',service:'qapath-api',version:'4.0.0'}};}
}
