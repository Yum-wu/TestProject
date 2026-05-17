import pytest
from app.tools.calculator import calculator


class TestCalculator:
    def test_basic_addition(self):
        result = calculator.invoke({"expression": "1 + 1"})
        assert result == "2"

    def test_multiplication(self):
        result = calculator.invoke({"expression": "123 * 456"})
        assert result == "56088"

    def test_power(self):
        result = calculator.invoke({"expression": "2 ** 10"})
        assert result == "1024"

    def test_sqrt(self):
        result = calculator.invoke({"expression": "sqrt(16)"})
        assert "4" in result

    def test_security_blocked(self):
        with pytest.raises(ValueError, match="不允许"):
            calculator.invoke({"expression": "__import__('os').system('dir')"})
