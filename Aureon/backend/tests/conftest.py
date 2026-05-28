"""
Pytest shared fixtures for Chatbot backend tests.
"""
import pytest
from app.memory.db import init_db


@pytest.fixture(autouse=True)
def _init_db():
    """Ensure SQLite tables exist before each test."""
    init_db()
    yield
