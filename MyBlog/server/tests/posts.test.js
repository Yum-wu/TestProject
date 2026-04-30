/**
 * 文章 API 测试
 * - 创建文章
 * - 获取文章列表（分页、搜索、筛选）
 * - 获取文章详情
 * - 更新文章
 * - 删除文章
 * - 权限控制测试
 */

const request = require("supertest");
const app = require("../src/app");
const { execute } = require("../src/config/database");

// 测试用户和文章数据
let authorToken = "";
let otherUserToken = "";
let authorId = 0;
let otherUserId = 0;
let testPostId = 0;
let testCategoryId = 0;
let testTagId = 0;

/**
 * 初始化测试数据
 */
async function setupTestData() {
  try {
    // 清理旧测试数据
    await execute("DELETE FROM post_tags WHERE post_id IN (SELECT id FROM posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%posttest%'))");
    await execute("DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%posttest%'))");
    await execute("DELETE FROM posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%posttest%')");
    await execute("DELETE FROM users WHERE email LIKE '%posttest%'");
    await execute("DELETE FROM categories WHERE slug = 'test-category'");
    await execute("DELETE FROM tags WHERE slug = 'test-tag'");

    // 创建作者用户
    const authorRes = await request(app).post("/api/auth/register").send({
      username: "postauthor",
      email: "postauthor@test.com",
      password: "test123456",
    });
    authorToken = authorRes.body.data.token;
    authorId = authorRes.body.data.user.id;

    // 创建另一个用户
    const otherRes = await request(app).post("/api/auth/register").send({
      username: "postother",
      email: "postother@test.com",
      password: "test123456",
    });
    otherUserToken = otherRes.body.data.token;
    otherUserId = otherRes.body.data.user.id;

    // 创建测试分类
    const catResult = await execute(
      "INSERT INTO categories (name, slug) VALUES (?, ?)",
      ["测试分类", "test-category"]
    );
    testCategoryId = catResult.insertId;

    // 创建测试标签
    const tagResult = await execute(
      "INSERT INTO tags (name, slug) VALUES (?, ?)",
      ["测试标签", "test-tag"]
    );
    testTagId = tagResult.insertId;
  } catch (err) {
    console.error("测试数据初始化失败:", err.message);
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  try {
    await execute("DELETE FROM post_tags WHERE post_id IN (SELECT id FROM posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%posttest%'))");
    await execute("DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%posttest%'))");
    await execute("DELETE FROM posts WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%posttest%')");
    await execute("DELETE FROM users WHERE email LIKE '%posttest%'");
    await execute("DELETE FROM categories WHERE slug = 'test-category'");
    await execute("DELETE FROM tags WHERE slug = 'test-tag'");
  } catch {
    // 忽略清理错误
  }
}

beforeAll(async () => {
  await setupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

/* ===== 创建文章测试 ===== */
describe("POST /api/posts - 创建文章", () => {
  test("正常创建草稿 - 应返回 201", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "测试文章标题",
        content: "这是测试文章的内容，包含一些文字。",
        status: "draft",
        category_id: testCategoryId,
        tag_ids: [testTagId],
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.title).toBe("测试文章标题");
    expect(res.body.data.status).toBe("draft");
    expect(res.body.data).toHaveProperty("slug");

    testPostId = res.body.data.id;
  });

  test("正常创建已发布文章 - 应返回 201", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "已发布的测试文章",
        content: "这篇测试文章是已发布状态。",
        status: "published",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("published");
  });

  test("未认证创建 - 应返回 401", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "未认证文章",
      content: "内容",
    });

    expect(res.status).toBe(401);
  });

  test("标题为空 - 应返回 422", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "",
        content: "有内容但没标题",
      });

    expect(res.status).toBe(422);
  });

  test("内容为空 - 应返回 422", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "有标题但没内容",
        content: "",
      });

    expect(res.status).toBe(422);
  });

  test("无效的状态值 - 应返回 422", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "无效状态文章",
        content: "内容",
        status: "invalid_status",
      });

    expect(res.status).toBe(422);
  });

  test("不存在的分类 - 应返回 404", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "无效分类文章",
        content: "内容",
        category_id: 99999,
      });

    expect(res.status).toBe(404);
  });

  test("标题超长 - 应返回 422", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "a".repeat(201),
        content: "内容",
      });

    expect(res.status).toBe(422);
  });
});

/* ===== 获取文章列表测试 ===== */
describe("GET /api/posts - 获取文章列表", () => {
  test("默认查询 - 应返回 200 和分页数据", async () => {
    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("items");
    expect(res.body.data).toHaveProperty("pagination");
    expect(res.body.data.pagination).toHaveProperty("total");
    expect(res.body.data.pagination).toHaveProperty("page");
    expect(res.body.data.pagination).toHaveProperty("pageSize");
  });

  test("分页参数 - 应正确返回指定页", async () => {
    const res = await request(app).get("/api/posts?page=1&pageSize=5");

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.pageSize).toBeLessThanOrEqual(5);
  });

  test("关键词搜索 - 应返回匹配结果", async () => {
    const res = await request(app).get("/api/posts?keyword=测试");

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  test("分类筛选 - 应返回指定分类的文章", async () => {
    const res = await request(app).get(
      `/api/posts?categoryId=${testCategoryId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  test("标签筛选 - 应返回指定标签的文章", async () => {
    const res = await request(app).get(`/api/posts?tagId=${testTagId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  test("无效分页参数 - 应使用安全默认值", async () => {
    const res = await request(app).get("/api/posts?page=-1&pageSize=9999");

    expect(res.status).toBe(200);
    // 负数页码应被修正为 1，超大 pageSize 应被限制
    expect(res.body.data.pagination.page).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination.pageSize).toBeLessThanOrEqual(100);
  });

  test("LIKE 通配符注入 - 应安全处理特殊字符", async () => {
    const res = await request(app).get("/api/posts?keyword=%25_test");

    expect(res.status).toBe(200);
    // 不应崩溃，通配符应被转义
    expect(res.body.data.items).toBeInstanceOf(Array);
  });
});

/* ===== 获取文章详情测试 ===== */
describe("GET /api/posts/:slug - 获取文章详情", () => {
  test("存在的文章 - 应返回 200", async () => {
    // 先获取文章列表得到 slug
    const listRes = await request(app).get("/api/posts?keyword=测试文章标题");
    if (listRes.body.data.items.length > 0) {
      const slug = listRes.body.data.items[0].slug;
      const res = await request(app).get(`/api/posts/${slug}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("title");
      expect(res.body.data).toHaveProperty("content");
      expect(res.body.data).toHaveProperty("author");
    }
  });

  test("不存在的 slug - 应返回 404", async () => {
    const res = await request(app).get("/api/posts/nonexistent-slug-12345");

    expect(res.status).toBe(404);
  });

  test("浏览量应递增", async () => {
    const listRes = await request(app).get("/api/posts?keyword=已发布的测试文章");
    if (listRes.body.data.items.length > 0) {
      const slug = listRes.body.data.items[0].slug;

      const res1 = await request(app).get(`/api/posts/${slug}`);
      const viewCount1 = res1.body.data.view_count;

      const res2 = await request(app).get(`/api/posts/${slug}`);
      const viewCount2 = res2.body.data.view_count;

      expect(viewCount2).toBeGreaterThan(viewCount1);
    }
  });
});

/* ===== 更新文章测试 ===== */
describe("PUT /api/posts/:id - 更新文章", () => {
  test("作者更新自己的文章 - 应返回 200", async () => {
    const res = await request(app)
      .put(`/api/posts/${testPostId}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "更新后的标题",
        content: "更新后的内容",
        status: "published",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("更新后的标题");
  });

  test("非作者更新他人文章 - 应返回 403", async () => {
    const res = await request(app)
      .put(`/api/posts/${testPostId}`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({
        title: "尝试修改他人文章",
      });

    expect(res.status).toBe(403);
  });

  test("未认证更新 - 应返回 401", async () => {
    const res = await request(app).put(`/api/posts/${testPostId}`).send({
      title: "未认证更新",
    });

    expect(res.status).toBe(401);
  });

  test("不存在的文章 - 应返回 404", async () => {
    const res = await request(app)
      .put("/api/posts/99999")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "不存在的文章",
      });

    expect(res.status).toBe(404);
  });

  test("无效的文章 ID - 应返回 422", async () => {
    const res = await request(app)
      .put("/api/posts/invalid")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "无效ID",
      });

    expect(res.status).toBe(422);
  });
});

/* ===== 删除文章测试 ===== */
describe("DELETE /api/posts/:id - 删除文章", () => {
  let deletePostId = 0;

  beforeAll(async () => {
    // 创建一个用于删除测试的文章
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authorToken}`)
      .send({
        title: "待删除的文章",
        content: "这篇文章将被删除。",
        status: "draft",
      });
    deletePostId = res.body.data.id;
  });

  test("非作者删除他人文章 - 应返回 403", async () => {
    const res = await request(app)
      .delete(`/api/posts/${deletePostId}`)
      .set("Authorization", `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  test("作者删除自己的文章 - 应返回 200", async () => {
    const res = await request(app)
      .delete(`/api/posts/${deletePostId}`)
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(200);
  });

  test("删除不存在的文章 - 应返回 404", async () => {
    const res = await request(app)
      .delete("/api/posts/99999")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(404);
  });

  test("未认证删除 - 应返回 401", async () => {
    const res = await request(app).delete(`/api/posts/${testPostId}`);

    expect(res.status).toBe(401);
  });
});

/* ===== 封面图上传测试 ===== */
describe("POST /api/posts/upload-cover - 封面图上传", () => {
  test("未认证上传 - 应返回 401", async () => {
    const res = await request(app)
      .post("/api/posts/upload-cover")
      .attach("cover", Buffer.from("fake image"), "test.jpg");

    expect(res.status).toBe(401);
  });

  test("无文件上传 - 应返回 400", async () => {
    const res = await request(app)
      .post("/api/posts/upload-cover")
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.status).toBe(400);
  });
});
