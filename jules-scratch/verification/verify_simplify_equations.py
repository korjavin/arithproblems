from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto('http://localhost:8000')
    page.wait_for_load_state('networkidle')

    # Wait for the main header to be visible
    header = page.get_by_role("heading", name="Math Worksheet Generator")
    expect(header).to_be_visible()

    # Locate the card and wait for it to be visible
    card = page.locator('[data-topic="simplify-equations"]')
    expect(card).to_be_visible()
    card.click()

    page.wait_for_timeout(200) # Increased timeout just in case

    # Check if the card got the 'selected' class
    expect(card).to_have_class("topic-card selected")

    # Now wait for the control
    control = page.locator('#se-complexity')
    expect(control).to_be_visible()

    page.screenshot(path='jules-scratch/verification/verification.png')
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
