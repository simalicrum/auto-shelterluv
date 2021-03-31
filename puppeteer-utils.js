require('./log');

gotoURL = async (page, gotoURL, options) => {
  await writeToConsole("GOTO REQ " + gotoURL);
  const res = await page.goto(gotoURL, options);
  await resStatusToConsole("GOTO RES", res);
  return res;
}

clickSelector = async (page, selector) => {
  await page.waitForSelector(selector);
  await page.click(selector);
  await writeToConsole("CLICK selector", selector);
}

typeText = async (page, selector, text) => {
  await page.type(selector, text);
  await writeToConsole("TYPE", text);
}

selectMulti = async (page, selector, option) => {
  await page.select(selector, option);
  await writeToConsole("SELECT" + " " + selector + " " + option);
}