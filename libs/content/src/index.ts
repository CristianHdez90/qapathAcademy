import catalog from './data/catalog.json';
import guides from './data/study-guides.json';
import scrum from './data/scrum.json';
import exercises from './data/practical-exercises.json';
import foundation from './data/fundamentals-v2.json';
import foundationKeys from './data/fundamentals-v2-keys.json';
/** Fuente de contenidos académicos. No es dominio ni adaptador de persistencia. */
export const contentSnapshot={catalog,guides,scrum,exercises,foundation};
/** Claves de los minitests de Fundamentos v2: solo para corrección en el servidor, nunca se sirven al cliente. */
export const foundationAnswerKeys=foundationKeys as Record<string,{correct:string;feedback:Record<string,string>}>;
