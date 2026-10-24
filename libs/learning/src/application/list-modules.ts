import type {ModuleCatalogPort} from '../domain/content-repository';
/** Caso de uso: agrega información de módulos con semanas, sin acceder a HTTP. */
export class ListModules {
  constructor(private readonly repository:ModuleCatalogPort) {}
  execute(){return this.repository.modules().map(module=>({
    ...module, weekDetails:this.repository.weeks().filter(w=>w.module===module.id)
  }));}
}
