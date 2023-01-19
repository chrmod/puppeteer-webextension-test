import puppeteer from 'puppeteer';
import { firefox } from 'playwright-firefox';
import getPort from 'get-port';
import { connect } from './node_modules/web-ext/lib/firefox/remote.js';
import fs from 'node:fs';
import path from 'node:path';

const ADDON_UUID = 'd56a5b99-51b6-4e83-ab23-796216679614';
const ADDON_ID = JSON.parse(fs.readFileSync(path.join('webextension-dummy', 'manifest.json'))).browser_specific_settings.gecko.id;

const rppPort = await getPort();
const browser = await puppeteer.launch({
  headless: false,
  product: 'firefox',
  args: [
    `--start-debugger-server=${rppPort}`,
  ],
  extraPrefsFirefox: {
    'devtools.chrome.enabled': true,
    'devtools.debugger.prompt-connection': false,
    'devtools.debugger.remote-enabled': true,
    'toolkit.telemetry.reportingpolicy.firstRun': false,
    'extensions.webextensions.uuids': `{"${ADDON_ID}": "${ADDON_UUID}"}`,
  },
  executablePath: firefox.executablePath(),
});

const rdp = await connect(rppPort);
await rdp.installTemporaryAddon(path.resolve('webextension-dummy'));

const page = await browser.newPage();
await page.goto(`moz-extension://${ADDON_UUID}/index.html`);
await page.click('button');
await browser.close();
