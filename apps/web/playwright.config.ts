import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',timeout:30_000,fullyParallel:true,retries:process.env.CI?2:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:3000',trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'webkit',use:{...devices['Desktop Safari']}}],
 webServer:{command:'pnpm -w dev',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI,timeout:180_000}
});
