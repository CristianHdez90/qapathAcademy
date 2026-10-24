import type {Progress} from './progress';
export interface ProgressRepository {read():Progress;save(progress:Progress):void;}
