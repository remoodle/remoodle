import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const CONFIG = {
  WEBSITE_URL: "https://aitumap.remoodle.app",
  SEARCH_SELECTOR: "input.chakra-input",
  WAIT_AFTER_SEARCH: 3000,
};

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function sanitize(name) {
  return name.replace(/[/\\?%*:|"<>.\s]/g, "-");
}

const cabinets = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "cabinets.json"), "utf8"));

for (const cabinet of cabinets) {
  test(cabinet, async ({ page }) => {
    await page.goto(CONFIG.WEBSITE_URL);
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator(CONFIG.SEARCH_SELECTOR);
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Double-entry workaround for a site search bug
    await searchInput.fill(cabinet);
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    await searchInput.clear();
    await searchInput.pressSequentially(cabinet);
    await searchInput.press("Enter");

    await page.waitForTimeout(CONFIG.WAIT_AFTER_SEARCH);

    await page.evaluate(() => {
      const search = document.querySelector(".search");
      const drawer = document.querySelector("#drawer-state__open");
      const label = document.querySelector('label[for="drawer-state"]');
      if (search) search.style.visibility = "hidden";
      if (drawer) drawer.style.display = "none";
      if (label) label.style.display = "none";
    });

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${sanitize(cabinet)}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}
