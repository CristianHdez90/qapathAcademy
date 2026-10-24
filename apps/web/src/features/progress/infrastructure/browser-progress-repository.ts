import type {ProgressRepository} from '@qapath/progress';
import {emptyProgress,fromUnknown} from '@qapath/progress';
import type {Progress} from '@qapath/progress';
/** Adaptador local y privado: progreso por navegador hasta implementar autenticación. */
export class BrowserProgressRepository implements ProgressRepository {
  private readonly key='qapath-academy-v2';
  read():Progress{
    if(typeof window==='undefined')return emptyProgress();
    try {
      const raw=window.localStorage.getItem(this.key)||window.localStorage.getItem('qapath-academy-v1');
      return raw?fromUnknown(JSON.parse(raw)):emptyProgress();
    } catch {return emptyProgress();}
  }
  save(value:Progress){if(typeof window!=='undefined')window.localStorage.setItem(this.key,JSON.stringify(value));}
}
