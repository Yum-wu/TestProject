from playwright.sync_api import sync_playwright
import sys

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        
        sys.stdout.write(f"\n=== Console Logs ({len(console_logs)}) ===\n")
        for log in console_logs:
            sys.stdout.write(f"  {log}\n")
        
        sys.stdout.write(f"\n=== Page Errors ({len(errors)}) ===\n")
        for err in errors:
            sys.stdout.write(f"  {err[:200]}\n")
        
        root = page.locator("#root")
        sys.stdout.write(f"\nRoot children: {root.evaluate('el => el.children.length')}\n")
        sys.stdout.flush()
        
        browser.close()

if __name__ == "__main__":
    run_tests()