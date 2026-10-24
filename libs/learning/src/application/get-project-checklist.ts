import type {ProjectChecklistPort} from '../domain/content-repository';
export class GetProjectChecklist { constructor(private readonly repository:ProjectChecklistPort){} execute(){return this.repository.checklist();} }
