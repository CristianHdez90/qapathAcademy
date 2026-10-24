import type {LessonPort} from '../domain/content-repository';
import {NotFoundError} from '../domain/errors';
import {WeekNumber} from '../domain/week-number';
export class GetLesson {
  constructor(private readonly repository:LessonPort){}
  execute(id:number){
    const weekNumber=WeekNumber.create(id);
    const week=this.repository.week(weekNumber.value);
    const guide=this.repository.guide(weekNumber.value);
    if(!week||!guide)throw new NotFoundError('Lección');
    return {week,guide};
  }
}
