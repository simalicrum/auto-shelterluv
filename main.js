require('dotenv').config()
require('./login');
require('./log');
require('./puppeteer-utils')

const puppeteer = require('puppeteer');
const fs = require ("fs");
const csv = require("neat-csv");

const baseURL = "https://www.shelterluv.com/";

const loginOptions = {
  user: process.env.SHELTERLUV_USER,
  password: process.env.SHELTERLUV_PASS,
  userSelector: '#edit-name',
  passSelector: '#edit-pass',
  loginURL: baseURL + 'user/login',
  successURL: baseURL + 'content/vokra'
}

getBrowser = async () => {

  const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    }); // default is true
    return browser;

};

(async () => {
  console.log("Starting Shelterluv Auto-Updater");
  const args = process.argv.slice(2);
  const inputCSV = args[0];
  const fileStream = fs.createReadStream(inputCSV, { highWaterMark: 1000000 });
  const cats = await csv(fileStream);
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setDefaultTimeout(60000);
  await login(page, loginOptions); 
  for (cat of cats) {
    try {
      console.log(new Date().toLocaleString() + " " + "Processing cat " + cat.catCode);
      await gotoURL(page, baseURL + cat.catCode);
      switch (cat.deleteMicrochipRecord) {
        case "YES":
          console.log(new Date().toLocaleString() + " " + "Deleting microchip entry for cat " + cat.catCode);
          await clickSelector(page, `[onclick="enable_edit_mode(this);"]`);
          await clickSelector(page, "#current_number");
          await page.waitForSelector(`#mc_delbutton`);
          const delSelector = await page.$("#mc_delbutton");
          const rect = await page.evaluate(async (delSelector) => {
            const {top, left, bottom, right} = await delSelector.getBoundingClientRect();
            return {top, left, bottom, right};
          }, delSelector);
          await page.mouse.click(rect.left + 10, rect.top + 10);
          await page.waitForSelector("#mc_delbutton", { hidden: true });
          await clickSelector(page, `[onclick="exit_edit_mode(this)"]`);
          break;
        case "UPDATE":
          console.log(new Date().toLocaleString() + " " + "Updating microchip entry for cat " + cat.catCode);
          console.log(new Date().toLocaleString() + " " + "Updating from " + cat.oldMicrochip + " to " + cat.newMicrochip);
          await clickSelector(page, `[onclick="enable_edit_mode(this);"]`);
          await clickSelector(page, "#current_number");
          await clickSelector(page, "#new_mchip_number");
          await page.focus("#new_mchip_number");
          const inputValue = await page.$eval('#new_mchip_number', el => el.value);
          console.log(new Date().toLocaleString() + " " + "Found old microchip entry on page: " + inputValue);
          for (let i = 0; i < inputValue.length; i++) {
            await page.keyboard.press('Backspace');
          }
          await typeText(page, '#new_mchip_number', cat.newMicrochip);
          await selectMulti(page, "#new_mchip_issuer", "Other");
          await clickSelector(page, "#micro_chip_edit_bt");
          await page.waitForSelector("#mc_delbutton", { hidden: true });
          await clickSelector(page, `[onclick="exit_edit_mode(this)"]`);
          break;
        case "NO":
          console.log(new Date().toLocaleString() + " " + "Not modifying microchip entry for cat " + cat.catCode);
      }
      switch (cat.addEarTag) {
        case "YES":
          console.log(new Date().toLocaleString() + " " + "Adding ear tag entry for cat " + cat.catCode);
          await clickSelector(page, "#add_past_id_");
          await page.waitForSelector("#field_title");
          await typeText(page, "#field_title", cat.tattoo);
          await selectMulti(page, "select#field_body", "Ear Tag");
          await selectMulti(page, "select#field_issuing_shelter", "VOKRA");
          await clickSelector(page, `[onclick="save_past_id()"]`);
          await page.waitForSelector("#field_title", { hidden: true });
          break;
        case "NO":
          console.log(new Date().toLocaleString() + " " + "Not adding ear tag entry for cat " + cat.catCode);
      }
      console.log(new Date().toLocaleString() + " " + "Finished processing cat " + cat.catCode);
 //     await page.waitForTimeout(1000);
    } catch (err) {
      console.error(err);
    }
  }
  await browser.close();
  console.log(new Date().toLocaleString() + " " + "Shelterluv Auto-Updater is done.");
})();