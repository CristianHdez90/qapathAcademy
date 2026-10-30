import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',testMatch:['catalog-300.spec.ts','study-content-320.spec.ts','outline-330.spec.ts','modules-331.spec.ts'],timeout:60000,expect:{timeout:15000},fullyParallel:false,workers:1,retries:0,
 reporter:[['list'],['html',{outputFolder:'playwright-report/catalog-300',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:3017',trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'webkit',use:{...devices['Desktop Safari']}}],
 webServer:[
  {command:'node ../../tests/fixtures/catalog-server.mjs',url:'http://127.0.0.1:4017/api/v1/courses',reuseExistingServer:true,timeout:90000,env:{NODE_ENV:'test',CATALOG_TEST_ORIGIN:'http://127.0.0.1:3017'}},
  {command:'pnpm exec next start --hostname 127.0.0.1 --port 3017',url:'http://127.0.0.1:3017',reuseExistingServer:false,timeout:90000,env:{NODE_ENV:'production',API_INTERNAL_URL:'http://127.0.0.1:4017'}}
 ]
});
