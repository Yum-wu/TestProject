"""
Tests for Memory Manager: session tracking, background tasks, flush.
"""
import pytest
import time
from unittest.mock import patch, MagicMock
from app.memory.manager import MemoryManager


class TestMemoryManagerInit:
    def setup_method(self):
        self.mgr = MemoryManager()

    def test_empty_on_init(self):
        assert self.mgr.get_active_sessions() == []

    def test_touch_session_creates_entry(self):
        self.mgr.touch_session("sess_1")
        assert "sess_1" in self.mgr.get_active_sessions()

    def test_touch_session_updates_time(self):
        self.mgr.touch_session("sess_1")
        t1 = self.mgr._sessions["sess_1"]["last_active"]
        time.sleep(0.01)
        self.mgr.touch_session("sess_1")
        t2 = self.mgr._sessions["sess_1"]["last_active"]
        assert t2 >= t1

    def test_record_message_touches_session(self):
        with patch("app.memory.manager.l0_conversation.record_message"), \
             patch("app.memory.manager.l0_conversation.cleanup_oldest"):
            self.mgr.record_message("sess_2", "user", "hello")
        assert "sess_2" in self.mgr.get_active_sessions()

    def test_clear_session_removes(self):
        self.mgr.touch_session("sess_3")
        self.mgr.clear_session("sess_3")
        assert "sess_3" not in self.mgr.get_active_sessions()


class TestMemoryManagerScenario:
    def setup_method(self):
        self.mgr = MemoryManager()

    def test_finalize_scenario_calls_l2_and_l3(self):
        with patch("app.memory.manager.l2_scenario.finalize_scenario") as mock_l2, \
             patch("app.memory.manager.l3_persona.update_persona") as mock_l3:
            self.mgr.finalize_scenario("sess_final", summary="test")
            mock_l2.assert_called_once_with("sess_final", summary="test")
            mock_l3.assert_called_once_with("sess_final")

    def test_flush_all_scenarios_iterates_sessions(self):
        self.mgr.touch_session("sess_a")
        self.mgr.touch_session("sess_b")
        with patch.object(self.mgr, "finalize_scenario") as mock_finalize:
            self.mgr.flush_all_scenarios()
            assert mock_finalize.call_count >= 2


class TestMemoryManagerContext:
    def setup_method(self):
        self.mgr = MemoryManager()

    def test_get_context_empty(self):
        with patch("app.memory.manager.l3_persona.get_persona", return_value=""), \
             patch("app.memory.manager.l2_scenario.get_recent_scenarios", return_value=[]):
            context = self.mgr.get_context("sess_ctx")
            assert context == ""

    def test_get_context_with_persona(self):
        with patch("app.memory.manager.l3_persona.get_persona", return_value="## Persona\nUser likes Python"), \
             patch("app.memory.manager.l2_scenario.get_recent_scenarios", return_value=[]):
            context = self.mgr.get_context("sess_ctx")
            assert "Persona" in context
            assert "Python" in context


class TestMemoryManagerOffload:
    def setup_method(self):
        self.mgr = MemoryManager()

    def test_offload_if_needed_passthrough_short(self):
        with patch("app.memory.manager.offload.offload_if_needed", return_value="short text"):
            result = self.mgr.offload_if_needed("calc", "short text", "sess")
            assert result == "short text"

    def test_read_ref_delegates(self):
        with patch("app.memory.manager.offload.read_ref", return_value="file content"):
            result = self.mgr.read_ref("test.md")
            assert result == "file content"
