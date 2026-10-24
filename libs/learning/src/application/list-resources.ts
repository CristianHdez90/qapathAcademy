import type {ResourcesPort} from '../domain/content-repository';
export class ListResources { constructor(private readonly repository:ResourcesPort){} execute(){return this.repository.resources();} }
