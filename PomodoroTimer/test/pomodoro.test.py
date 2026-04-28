from playwright.sync_api import sync_playwright, expect

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        print("=== Test 1: Check page loads correctly ===")
        context = browser.new_context()
        page = context.new_page()
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        
        expect(page).to_have_title("25:00 - 工作 | 番茄钟", timeout=10000)
        print("✓ Page title is correct")
        
        heading = page.locator("h1")
        expect(heading).to_have_text("番茄钟")
        print("✓ Main heading is correct")
        
        print("\n=== Test 2: Check timer display ===")
        timer_display = page.locator("div.font-mono").first
        expect(timer_display).to_have_text("25:00")
        print("✓ Timer shows 25:00")
        
        mode_text = page.locator("span.text-pomodoro-red").first
        expect(mode_text).to_have_text("工作")
        print("✓ Mode shows 工作")
        
        print("\n=== Test 3: Check controls are visible ===")
        start_btn = page.locator("button", has_text="开始")
        expect(start_btn).to_be_visible()
        print("✓ Start button is visible")
        
        reset_btn = page.locator("button", has_text="重置")
        expect(reset_btn).to_be_visible()
        print("✓ Reset button is visible")
        
        print("\n=== Test 4: Check settings panel ===")
        work_input = page.locator("input[type='number']").first
        expect(work_input).to_have_value("25")
        print("✓ Work duration shows 25")
        
        break_input = page.locator("input[type='number']").nth(1)
        expect(break_input).to_have_value("5")
        print("✓ Break duration shows 5")
        
        print("\n=== Test 5: Check stats panel ===")
        stats_heading = page.locator("h3", has_text="统计")
        expect(stats_heading).to_be_visible()
        print("✓ Stats panel is visible")
        
        today_count = page.locator(".text-pomodoro-red.text-2xl")
        expect(today_count).to_have_text("0")
        print("✓ Today count is 0")
        
        print("\n=== Test 6: Check timer can start and pause ===")
        page.locator("button", has_text="开始").click()
        page.wait_for_timeout(500)
        
        pause_btn = page.locator("button", has_text="暂停")
        expect(pause_btn).to_be_visible()
        print("✓ Pause button appears after start")
        
        status_text = page.locator("span.text-pomodoro-muted").first
        expect(status_text).to_have_text("进行中")
        print("✓ Status changed to 进行中")
        
        pause_btn.click()
        page.wait_for_timeout(200)
        
        continue_btn = page.locator("button", has_text="继续")
        expect(continue_btn).to_be_visible()
        print("✓ Continue button appears after pause")
        
        print("\n=== Test 7: Check timer reset ===")
        page.locator("button", has_text="重置").click()
        page.wait_for_timeout(200)
        
        expect(page.locator("div.font-mono").first).to_have_text("25:00")
        print("✓ Timer reset to 25:00")
        
        expect(page.locator("button", has_text="开始")).to_be_visible()
        print("✓ Start button visible after reset")
        
        print("\n=== Test 8: Check time can be edited by clicking ===")
        page.reload()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        
        minutes_span = page.locator("span.cursor-pointer").first
        expect(minutes_span).to_be_visible()
        print("✓ Minutes span is clickable")
        
        minutes_span.click()
        page.wait_for_timeout(200)
        
        edit_input = page.locator("input[type='text']")
        expect(edit_input).to_be_visible()
        print("✓ Edit input appears")
        
        edit_input.fill("15")
        edit_input.press("Enter")
        page.wait_for_timeout(300)
        
        expect(page.locator("div.font-mono").first).to_have_text("15:00")
        print("✓ Timer updated to 15:00 after editing")
        
        print("\n=== Test 9: Check settings persist after reload ===")
        work_input = page.locator("input[type='number']").first
        work_input.fill("30")
        break_input = page.locator("input[type='number']").nth(1)
        break_input.fill("10")
        
        page.locator("button", has_text="保存设置").click()
        page.wait_for_timeout(200)
        
        page.reload()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        
        expect(page.locator("input[type='number']").first).to_have_value("30")
        expect(page.locator("input[type='number']").nth(1)).to_have_value("10")
        print("✓ Settings persisted after reload")
        
        expect(page).to_have_title("30:00 - 工作 | 番茄钟", timeout=10000)
        print("✓ Title updated to match new settings")
        
        print("\n=== Test 10: Check responsive layout ===")
        page.set_viewport_size({"width": 375, "height": 667})
        page.wait_for_timeout(300)
        
        expect(page.locator("h1")).to_be_visible()
        expect(page.locator("div.font-mono")).to_be_visible()
        expect(page.locator("button", has_text="开始")).to_be_visible()
        print("✓ Responsive layout works on mobile viewport")
        
        print("\n=== All 10 tests passed! ===")
        
        browser.close()

if __name__ == "__main__":
    run_tests()
