const puppeteer = require('puppeteer');
require('./puppeteer-utils');

login = async (page, params) => {
  try {
    const {user, password, userSelector, passSelector, loginURL, successURL} = params;
    await gotoURL(page, loginURL);
    await page.type(userSelector, user);
    await page.type(passSelector, password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation(successURL);
  } catch (err) {
    console.error(err);
  }
}