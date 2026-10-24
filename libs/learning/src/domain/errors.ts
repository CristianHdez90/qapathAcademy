export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';
  constructor(resource:string) { super(`${resource} no encontrado`); this.name='NotFoundError'; }
}
export class ValidationError extends Error {
  readonly code = 'VALIDATION_ERROR';
  constructor(message:string) { super(message); this.name='ValidationError'; }
}
