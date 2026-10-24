import {defineConfig,devices} from '@playwright/test';
const compiledServers=!!process.env.CI||process.env.E2E_PRODUCTION==='true';
const baseURL=process.env.E2E_BASE_URL||'http://127.0.0.1:3000';
const apiURL=process.env.API_INTERNAL_URL||'http://localhost:4000';
const webPort=Number(new URL(baseURL).port||3000);
const apiPort=Number(new URL(apiURL).port||4000);
export default defineConfig({
 testDir:'./tests/e2e',timeout:30_000,fullyParallel:true,retries:process.env.CI?2:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL,trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'webkit',use:{...devices['Desktop Safari']}}],
 // CI prueba los artefactos compilados; el modo interactivo local conserva los watchers.
 webServer:compiledServers?[
  {command:'pnpm --filter @qapath/api start',url:`${apiURL}/api/v1/health`,reuseExistingServer:false,timeout:60_000,
   env:{NODE_ENV:'test',PORT:String(apiPort),APP_URL:baseURL,WEB_ORIGIN:baseURL}},
  {command:`pnpm --filter @qapath/web exec next start --port ${webPort}`,url:baseURL,reuseExistingServer:false,timeout:60_000,
   env:{NODE_ENV:'production',API_INTERNAL_URL:apiURL}}
 ]:{command:'pnpm -w dev',url:baseURL,reuseExistingServer:true,timeout:180_000}
});
