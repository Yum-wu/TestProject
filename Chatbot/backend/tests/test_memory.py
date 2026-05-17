import pytest
from app.memory.db import init_db, get_db
from app.memory.l0_conversation import record_message, get_conversation, cleanup_oldest
from app.memory.l1_atom import save_atom, search_atoms
from app.memory.offload import offload_if_needed, read_ref
from app.memory.l2_scenario import finalize_scenario
from app.memory.l3_persona import update_persona, get_persona


class TestL0Conversation:
    def setup_method(self):
        init_db()

    def test_record_and_retrieve(self):
        sid = "l0_test_" + str(hash("test_record_and_retrieve"))
        record_message(sid, "user", "hello", tokens=10)
        record_message(sid, "assistant", "hi", tokens=5)
        msgs = get_conversation(sid, limit=10)
        assert len(msgs) == 2
        roles = [m["role"] for m in msgs]
        assert "user" in roles
        assert "assistant" in roles


class TestL1Atom:
    def setup_method(self):
        init_db()

    def test_save_and_search(self):
        save_atom("test_sess", "user", "prefers", "React", confidence=0.8)
        results = search_atoms("test_sess", "React")
        assert len(results) >= 1
        assert results[0]["subject"] == "user"


class TestOffload:
    def test_short_content_not_offloaded(self):
        result = offload_if_needed("test", "short", "sess")
        assert result == "short"

    def test_long_content_offloaded(self):
        long_text = "x" * 2000
        result = offload_if_needed("calculator", long_text, "sess")
        assert "result_ref:" in result
        assert len(result) < len(long_text)


class TestL2Scenario:
    def test_finalize_scenario(self):
        record_message("sess_l2", "user", "test msg")
        finalize_scenario("sess_l2")
        from pathlib import Path
        files = list(Path("offloads/scenarios").glob("sess_l2_*.md"))
        assert len(files) >= 1


class TestL3Persona:
    def test_update_and_get(self):
        update_persona("sess_l3")
        content = get_persona()
        assert isinstance(content, str)
