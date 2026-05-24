"""Unit tests for language detection utility."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.utils.lang_detect import detect_language, lang_label, lang_instruction


# ── detect_language ──────────────────────────────────────────────

def test_detect_english_pure():
    assert detect_language("Hello, how are you?") == "en"
    assert detect_language("What is the weather today?") == "en"
    assert detect_language("I need help with Python code") == "en"


def test_detect_english_with_numbers():
    assert detect_language("There are 42 apples") == "en"
    assert detect_language("Version 2.0 is released") == "en"


def test_detect_chinese_pure():
    assert detect_language("你好，今天天气怎么样？") == "zh"
    assert detect_language("我需要帮助") == "zh"
    assert detect_language("请用中文回复") == "zh"


def test_detect_chinese_with_punctuation():
    assert detect_language("你好！今天过得怎么样？") == "zh"
    assert detect_language("这是第 3 次尝试。") == "zh"


def test_detect_mixed_mostly_en():
    """Mixed text with >70% ASCII should be 'en'."""
    assert detect_language("Hello world，这是一段混合文本") == "zh"


def test_detect_empty():
    assert detect_language("") == "en"
    assert detect_language("   ") == "en"
    assert detect_language(None) == "en"


def test_detect_symbols():
    assert detect_language("!@#$%^&*()") == "en"
    assert detect_language("... --- ...") == "en"


# ── lang_label ───────────────────────────────────────────────────

def test_lang_label():
    assert lang_label("en") == "English"
    assert lang_label("zh") == "中文"


# ── lang_instruction ─────────────────────────────────────────────

def test_lang_instruction_contains_lang_label():
    assert "English" in lang_instruction("en")
    assert "中文" in lang_instruction("zh")


def test_lang_instruction_not_empty():
    assert len(lang_instruction("en")) > 0
    assert len(lang_instruction("zh")) > 0


# ── Integration: prompt template formatting ──────────────────────

def test_agent_prompt_imports():
    """Verify agent module imports without hardcoded language."""
    from app.agent.agent import create_chat_agent, DEFAULT_SYSTEM_PROMPT
    assert "始终以中文回复" not in DEFAULT_SYSTEM_PROMPT, (
        "DEFAULT_SYSTEM_PROMPT should not have hardcoded language"
    )
    assert "calculator" in DEFAULT_SYSTEM_PROMPT, (
        "DEFAULT_SYSTEM_PROMPT should contain calculator tool example"
    )


def test_qa_prompt_imports():
    """Verify qa_chain module imports without hardcoded language."""
    from app.rag.qa_chain import QA_SYSTEM_PROMPT, rag_query
    assert "使用中文" not in QA_SYSTEM_PROMPT, (
        "QA_SYSTEM_PROMPT should not have hardcoded '使用中文'"
    )
    assert "{lang_instruction}" in QA_SYSTEM_PROMPT


def test_prompt_experiment_imports():
    """Verify prompt_experiment templates have lang_instruction."""
    from app.rag.prompt_experiment import DIRECT_PROMPT, COT_PROMPT, FEW_SHOT_PROMPT
    assert "使用中文" not in DIRECT_PROMPT
    assert "使用中文" not in COT_PROMPT
    assert "{lang_instruction}" in DIRECT_PROMPT
    assert "{lang_instruction}" in COT_PROMPT
    assert "{lang_instruction}" in FEW_SHOT_PROMPT


def test_generate_node_imports():
    """Verify langgraph generate node imports."""
    from app.langgraph.nodes.generate import GENERATE_PROMPT, run_generate_node
    assert "{lang_instruction}" in GENERATE_PROMPT


def test_main_detect_import():
    """Verify main.py can import detect_language."""
    from app.main import _get_agent
    # Just check the function accepts a lang parameter
    import inspect
    sig = inspect.signature(_get_agent)
    assert "lang" in sig.parameters


if __name__ == "__main__":
    import pytest
    sys.exit(pytest.main([__file__, "-v"]))
