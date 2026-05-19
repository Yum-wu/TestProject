"""
RAG API 测试脚本
在 MINGW64 / PowerShell / CMD 中运行:
  cd Chatbot/backend
  python test_rag.py

需要先启动后端: uvicorn app.main:app --reload --port 8000
"""

import requests
import json

BASE = "http://localhost:8000"

# 1. 健康检查
print("=" * 50)
print("1. 健康检查")
print("=" * 50)
try:
    r = requests.get(f"{BASE}/api/health", timeout=5)
    print(f"状态: {r.status_code}")
    print(f"响应: {json.dumps(r.json(), ensure_ascii=False, indent=2)}")
except Exception as e:
    print(f"❌ 后端未运行！请先启动: uvicorn app.main:app --reload --port 8000")
    print(f"错误: {e}")
    exit(1)

# 2. 索引文章
print("\n" + "=" * 50)
print("2. 索引知识库文章")
print("=" * 50)
r = requests.post(f"{BASE}/api/rag/index", timeout=30)
print(f"状态: {r.status_code}")
print(f"原始响应: {r.text[:500]}")
try:
    print(f"JSON: {json.dumps(r.json(), ensure_ascii=False, indent=2)}")
except:
    print("(响应不是 JSON)")

# 3. RAG 查询测试
queries = [
    "Hermes Agent 有几层记忆？",
    "Hermes Agent 的记忆层有哪些？",
    "什么是 Hermes Agent？",
    "怎么把 SPA 部署到 GitHub Pages？",
    "今天天气怎么样？",  # 不在知识库中
]

for i, q in enumerate(queries):
    print("\n" + "=" * 50)
    print(f"3.{i+1}. RAG 查询: {q}")
    print("=" * 50)
    r = requests.post(
        f"{BASE}/api/rag/query",
        json={"query": q, "top_k": 3, "use_mmr": True},
        timeout=30,
    )
    print(f"状态: {r.status_code}")
    data = r.json()
    print(f"答案: {data['answer'][:200]}...")
    print(f"来源数: {len(data['sources'])}")
    for s in data["sources"]:
        print(f"  - {s['title']} (score: {s.get('score', 'N/A')})")

print("\n✅ 测试完成！")
