import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',fullyParallel:true,forbidOnly:!!process.env.CI,retries:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:process.env.BASE_URL||'https://qapath-academy-vvfw.vercel.app',trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'firefox',use:{...devices['Desktop Firefox']}},{name:'webkit',use:{...devices['Desktop Safari']}}]
});
