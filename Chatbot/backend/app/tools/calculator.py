import math
import ast
import operator
from langchain.tools import tool

# Allowed operators and math functions for safe evaluation
_ALLOWED_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.Mod: operator.mod,
}

_ALLOWED_NAMES = {
    name: getattr(math, name)
    for name in dir(math)
    if not name.startswith("_")
}


def _safe_eval(expr: str) -> str:
    """Safely evaluate a mathematical expression using AST whitelist."""
    try:
        tree = ast.parse(expr, mode="eval")
    except SyntaxError as e:
        return f"表达式语法错误: {e}"

    def _walk(node):
        if isinstance(node, ast.Expression):
            return _walk(node.body)
        if isinstance(node, ast.Constant):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_OPS:
            left = _walk(node.left)
            right = _walk(node.right)
            return _ALLOWED_OPS[type(node.op)](left, right)
        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_OPS:
            return _ALLOWED_OPS[type(node.op)](_walk(node.operand))
        if isinstance(node, ast.Name) and node.id in _ALLOWED_NAMES:
            return _ALLOWED_NAMES[node.id]
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in _ALLOWED_NAMES:
            args = [_walk(a) for a in node.args]
            return _ALLOWED_NAMES[node.func.id](*args)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
            raise ValueError(f"不允许的操作: method call")
        if isinstance(node, ast.Attribute):
            raise ValueError(f"不允许的操作: Attribute access")
        raise ValueError(f"不允许的操作: {type(node).__name__}")

    return str(_walk(tree))


@tool
def calculator(expression: str) -> str:
    """计算数学表达式。支持四则运算、幂运算、三角函数、对数。
    输入: 数学表达式字符串，如 "2 + 3 * 4", "sqrt(16)", "2**10"
    """
    return _safe_eval(expression)
