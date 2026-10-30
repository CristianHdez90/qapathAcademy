import {DEFAULT_APPEARANCE,type AppearanceConfig} from '@qapath/contracts';
import {academyApi} from '@/lib/academy-api';
/** SSR: configuración publicada; ante cualquier fallo, el preset inicial (AC-16). Nunca un borrador. */
export async function loadPublishedAppearance():Promise<AppearanceConfig>{
 try{return (await academyApi.appearance()).config}catch{return DEFAULT_APPEARANCE}
}
