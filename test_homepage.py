from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    
    # Test 1: Homepage
    print("=== Testing Homepage ===")
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/01_homepage.png', full_page=True)
    
    # Get page title
    title = page.title()
    print(f"Page title: {title}")
    
    # Get all links on the page
    links = page.locator('a').all()
    print(f"Found {len(links)} links on homepage:")
    for i, link in enumerate(links):
        href = link.get_attribute('href')
        text = link.inner_text()
        print(f"  Link {i}: text='{text.strip()}' href='{href}'")
    
    # Get all buttons
    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons on homepage:")
    for i, btn in enumerate(buttons):
        text = btn.inner_text()
        print(f"  Button {i}: text='{text.strip()}'")
    
    # Check for any error text on page
    body_text = page.locator('body').inner_text()
    if 'error' in body_text.lower() or '404' in body_text:
        print("WARNING: Error text detected on homepage!")
    
    # Check page content
    print(f"\nPage content preview (first 500 chars):")
    print(body_text[:500])
    
    browser.close()
    print("\n=== Homepage test complete ===")
