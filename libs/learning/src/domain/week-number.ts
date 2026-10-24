import {ValidationError} from './errors';
/** Value Object inmutable para identificar una semana educativa. */
export class WeekNumber {
  private constructor(readonly value:number){}
  static create(value:number):WeekNumber {
    if(!Number.isSafeInteger(value)||value<1)throw new ValidationError('Número de semana inválido.');
    return new WeekNumber(value);
  }
  equals(other:WeekNumber){return this.value===other.value;}
}
