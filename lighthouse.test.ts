import lighthouseDesktopConfig from "lighthouse/core/config/lr-desktop-config.js";

import { BrowserContext } from "playwright";
import { test } from "@playwright/test";

import { playAudit } from "playwright-lighthouse";
import { chromium } from "playwright";

import * as rimraf from "rimraf";
import { Score, TestItem, createIndexFile, getTestItems } from "./helpers";

const lhThresholds = {
  // performance: 50,
  // accessibility: 50,
  // "best-practices": 50,
  // seo: 50,
  // pwa: 50,
};

const lhOptions = {
  // onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  onlyCategories: ["performance"],
};

const lhConfig = {
  ...lighthouseDesktopConfig,
};

const lhReports = {
  formats: {
    // json: true, //defaults to false
    html: true, //defaults to false
    // csv: true, //defaults to false
  },
  directory: `./test-results/lighthouse`,
};

// Function to perform login
const login = async (page: any) => {
  await page.goto("https://example.com");
  await page.fill("#username", "your-username");
  await page.fill("#password", "your-password");
  await page.click("#login-button");
  await page.waitForNavigation();
};

const testRoute = async (context: BrowserContext, testItem: TestItem) => {
  const page = await context.newPage();
  await page.goto(testItem.absRoute);

  const res = await playAudit({
    page: page,
    port: 9222,
    thresholds: lhThresholds,
    opts: lhOptions,
    config: lhConfig,
    reports: { ...lhReports, name: testItem.fileName },
  });

  const scores: Score[] = Object.values(res.lhr.categories).map((c) => {
    return [c.title, (c.score || 0) * 100];
  });
  testItem.scores = scores;

  await page.close();
};

test("lighhouse pages", async () => {
  // loads paths from json
  const testItems = getTestItems();

  // tmp directory for session data carry across tests (user logged in)
  const tmpUserDataDir = "./_tmp";

  //open chrome with persistant context
  const context = await chromium.launchPersistentContext(tmpUserDataDir, {
    headless: true,
    args: ["--remote-debugging-port=9222"],
  });

  // Perform login steps here
  // which will save to cookie or localStorage

  for (const item of testItems) {
    await testRoute(context, item);
  }

  await context.close();

  rimraf.sync(tmpUserDataDir);

  createIndexFile(testItems);
});
