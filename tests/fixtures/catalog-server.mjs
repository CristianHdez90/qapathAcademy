import {createCatalogFixture} from '../helpers/catalog-fixture.mjs';
if(process.env.NODE_ENV==='production')throw new Error('This synthetic catalog fixture must never run in production.');
const port=Number(process.env.CATALOG_TEST_PORT||4017),origin=process.env.CATALOG_TEST_ORIGIN||'http://127.0.0.1:3017';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('Only loopback origins are permitted.');
const fixture=await createCatalogFixture({port,origin});
console.log(`Synthetic SPEC-CATALOG-300 API: ${fixture.base}. PostgreSQL is embedded; no DATABASE_URL is used.`);
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{void fixture.close().finally(()=>process.exit(0))});
