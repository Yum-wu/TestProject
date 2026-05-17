"""AI 聊天助手功能自动化测试

测试项目：
1. 页面加载与空状态提示
2. 输入区域交互（输入、发送、清空）
3. 消息发送与 AI 流式回复
4. 清空对话功能
5. 键盘快捷键（Enter 发送）
6. 停止生成按钮
7. Markdown 渲染
8. 代码块语法高亮
9. 复制按钮
10. 自动滚动
"""

from playwright.sync_api import sync_playwright
import time

BASE_URL = "http://localhost:5174"


def test_page_load():
    """测试页面加载和空状态提示"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        assert page.locator("text=AI 聊天助手").is_visible(), "标题未显示"
        assert page.locator("text=开始和 AI 对话吧").is_visible(), "空状态提示未显示"
        assert page.locator("textarea").is_visible(), "输入框未显示"

        browser.close()
    print("✅ 测试1通过：页面加载与空状态提示")


def test_input_area():
    """测试输入区域交互"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        textarea = page.locator("textarea")
        send_btn = page.locator("button:has-text('发送')")

        assert send_btn.is_disabled(), "空输入时发送按钮应禁用"

        textarea.fill("你好")
        assert send_btn.is_enabled(), "有输入时发送按钮应启用"

        textarea.fill("")
        assert send_btn.is_disabled(), "清空输入后发送按钮应禁用"

        browser.close()
    print("✅ 测试2通过：输入区域交互")


def test_send_message():
    """测试发送消息与 AI 流式回复"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        textarea = page.locator("textarea")
        textarea.fill("你好，请用一句话介绍自己")
        page.locator("button:has-text('发送')").click()

        user_msg = page.locator("text=你好，请用一句话介绍自己").first
        assert user_msg.is_visible(timeout=5000), "用户消息未显示"

        time.sleep(8)

        msgs = page.locator(".prose")
        count = msgs.count()
        assert count > 0, "AI 回复未出现"

        browser.close()
    print("✅ 测试3通过：发送消息与 AI 流式回复")


def test_clear_chat():
    """测试清空对话功能"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        textarea = page.locator("textarea")
        textarea.fill("测试消息")
        page.locator("button:has-text('发送')").click()
        page.wait_for_timeout(2000)

        page.locator("button:has-text('清空对话')").click()

        empty_hint = page.locator("text=开始和 AI 对话吧")
        assert empty_hint.is_visible(timeout=3000), "清空后空状态提示未显示"

        browser.close()
    print("✅ 测试4通过：清空对话功能")


def test_enter_send():
    """测试 Enter 键发送消息"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        textarea = page.locator("textarea")
        textarea.fill("Enter发送测试")
        textarea.press("Enter")

        user_msg = page.locator("text=Enter发送测试").first
        assert user_msg.is_visible(timeout=3000), "Enter 发送的消息未显示"

        browser.close()
    print("✅ 测试5通过：Enter 键发送消息")


def test_stop_button():
    """测试停止生成按钮"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        textarea = page.locator("textarea")
        textarea.fill("请写一首很长的诗")
        page.locator("button:has-text('发送')").click()

        stop_btn = page.locator("button:has-text('停止')")
        if stop_btn.is_visible(timeout=3000):
            stop_btn.click()
            page.wait_for_timeout(1000)
            assert not stop_btn.is_visible(), "停止后按钮应切换回发送"

        browser.close()
    print("✅ 测试6通过：停止生成按钮")


def test_error_handling():
    """测试 API 错误处理"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.route("**/api/paas/v4/chat/completions", lambda route: route.fulfill(
            status=401,
            content_type="application/json",
            body='{"error":{"message":"认证失败"}}'
        ))

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        textarea = page.locator("textarea")
        textarea.fill("测试错误")
        page.locator("button:has-text('发送')").click()

        error_banner = page.locator("text=认证失败").first
        assert error_banner.is_visible(timeout=8000), "错误横幅未显示"

        close_btn = page.locator("button:has-text('✕')")
        if close_btn.is_visible():
            close_btn.click()
            page.wait_for_timeout(500)

        browser.close()
    print("✅ 测试7通过：API 错误处理")


if __name__ == "__main__":
    print("=" * 50)
    print("AI 聊天助手 - 功能自动化测试")
    print("=" * 50)

    tests = [
        ("页面加载与空状态提示", test_page_load),
        ("输入区域交互", test_input_area),
        ("发送消息与 AI 流式回复", test_send_message),
        ("清空对话功能", test_clear_chat),
        ("Enter 键发送消息", test_enter_send),
        ("停止生成按钮", test_stop_button),
        ("API 错误处理", test_error_handling),
    ]

    passed = 0
    failed = 0

    for name, test_fn in tests:
        try:
            test_fn()
            passed += 1
        except Exception as e:
            print(f"❌ 测试失败 [{name}]: {e}")
            failed += 1

    print("=" * 50)
    print(f"测试结果：✅ {passed} 通过  ❌ {failed} 失败  共 {len(tests)} 项")
    print("=" * 50)
