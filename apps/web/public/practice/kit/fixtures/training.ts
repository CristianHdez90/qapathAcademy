import {test as base,expect} from '@playwright/test';
import {QuotePage} from '../pages/QuotePage';
export const test=base.extend<{quotePage:QuotePage}>({quotePage:async({page},provide)=>{const quotePage=new QuotePage(page);await quotePage.open();await provide(quotePage)}});
export {expect};
