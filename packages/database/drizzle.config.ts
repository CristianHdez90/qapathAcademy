import {defineConfig} from 'drizzle-kit';
if(!process.env.DATABASE_URL)throw new Error('Defina DATABASE_URL para migraciones');
export default defineConfig({schema:'./src/schema.ts',out:'./drizzle',dialect:'postgresql',dbCredentials:{url:process.env.DATABASE_URL}});
