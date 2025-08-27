import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1920, "height": 1080})

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        await page.goto(f'file://{file_path}')

        # Wait for the page to load and take a screenshot in English
        await expect(page.locator('[data-translate-key="header_h1"]')).to_have_text("Math Worksheet Generator")
        await page.screenshot(path="jules-scratch/verification/verification_en.png")

        # Switch to German and take a screenshot
        de_button = page.locator('[data-lang="de"]')
        await de_button.click()
        await expect(page.locator('[data-translate-key="header_h1"]')).to_have_text("Mathe-Arbeitsblatt-Generator")
        await page.screenshot(path="jules-scratch/verification/verification_de.png")

        # Switch to Russian and take a screenshot
        ru_button = page.locator('[data-lang="ru"]')
        await ru_button.click()
        await expect(page.locator('[data-translate-key="header_h1"]')).to_have_text("Генератор математических заданий")
        await page.screenshot(path="jules-scratch/verification/verification_ru.png")

        await browser.close()

asyncio.run(main())
