/**
 * 认证 API 测试
 * - 用户注册
 * - 用户登录
 * - 获取用户资料
 * - 更新用户资料
 * - 安全性测试（无效输入、未授权访问等）
 */

const request = require("supertest");
const app = require("../src/app");
const { execute } = require("../src/config/database");
const bcrypt = require("bcryptjs");

// 测试用户数据
const testUser = {
  username: "authtest",
  email: "authtest@example.com",
  password: "test123456",
};

const testUser2 = {
  username: "authtest2",
  email: "authtest2@example.com",
  password: "test654321",
};

// 存储登录后的 token
let authToken = "";

/**
 * 清理测试数据
 */
async function cleanAuthTestData() {
  try {
    await execute("DELETE FROM users WHERE email LIKE '%authtest%'");
  } catch {
    // 忽略清理错误
  }
}

beforeAll(async () => {
  await cleanAuthTestData();
});

afterAll(async () => {
  await cleanAuthTestData();
});

/* ===== 注册接口测试 ===== */
describe("POST /api/auth/register - 用户注册", () => {
  test("正常注册 - 应返回 201 和用户信息+token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.user.email).toBe(testUser.email);
    // 确保不返回密码
    expect(res.body.data.user).not.toHaveProperty("password_hash");
  });

  test("重复用户名 - 应返回 409", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: testUser.username,
      email: "another@example.com",
      password: testUser.password,
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("用户名");
  });

  test("重复邮箱 - 应返回 409", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "anotheruser",
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("邮箱");
  });

  test("缺少必填字段 - 应返回 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "",
      email: "invalid-email",
      password: "123",
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("验证");
  });

  test("用户名过短 - 应返回 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "a",
      email: "valid@example.com",
      password: "password123",
    });

    expect(res.status).toBe(422);
  });

  test("密码过短 - 应返回 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "validuser",
      email: "valid2@example.com",
      password: "12345",
    });

    expect(res.status).toBe(422);
  });

  test("无效邮箱格式 - 应返回 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "validuser3",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(422);
  });

  test("XSS 防护 - 用户名中的脚本标签应被清理", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: '<script>alert("xss")</script>',
      email: "xss@example.com",
      password: "password123",
    });

    // 注册可能成功，但返回的用户名不应包含 script 标签
    if (res.status === 201) {
      expect(res.body.data.user.username).not.toContain("<script>");
    }
  });
});

/* ===== 登录接口测试 ===== */
describe("POST /api/auth/login - 用户登录", () => {
  test("正常登录 - 应返回 200 和用户信息+token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user).not.toHaveProperty("password_hash");

    // 保存 token 供后续测试使用
    authToken = res.body.data.token;
  });

  test("错误密码 - 应返回 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    // 不应泄露是邮箱错误还是密码错误
    expect(res.body.message).toContain("邮箱或密码错误");
  });

  test("不存在的邮箱 - 应返回 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    // 不应泄露用户是否存在
    expect(res.body.message).toContain("邮箱或密码错误");
  });

  test("空密码 - 应返回 422", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "",
    });

    expect(res.status).toBe(422);
  });

  test("无效邮箱格式 - 应返回 422", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(422);
  });
});

/* ===== 获取用户资料测试 ===== */
describe("GET /api/auth/profile - 获取用户资料", () => {
  test("已认证 - 应返回 200 和用户信息", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("username", testUser.username);
    expect(res.body.data).toHaveProperty("email", testUser.email);
    expect(res.body.data).not.toHaveProperty("password_hash");
  });

  test("未提供 token - 应返回 401", async () => {
    const res = await request(app).get("/api/auth/profile");

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("认证令牌");
  });

  test("无效 token - 应返回 401", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid_token_here");

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("无效");
  });

  test("过期 token - 应返回 401", async () => {
    // 使用一个已知过期的 token（手动构造）
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { id: 9999, username: "expired", email: "expired@test.com" },
      process.env.JWT_SECRET || "dev_only_insecure_jwt_secret_do_not_use_in_production",
      { expiresIn: "0s" }
    );

    // 等待 1 秒确保 token 已过期
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("过期");
  });

  test("缺少 Bearer 前缀 - 应返回 401", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", authToken);

    expect(res.status).toBe(401);
  });
});

/* ===== 更新用户资料测试 ===== */
describe("PUT /api/auth/profile - 更新用户资料", () => {
  let user2Token = "";

  beforeAll(async () => {
    // 注册第二个用户用于测试唯一性约束
    const regRes = await request(app).post("/api/auth/register").send({
      username: testUser2.username,
      email: testUser2.email,
      password: testUser2.password,
    });
    user2Token = regRes.body.data.token;
  });

  test("更新个人简介 - 应返回 200", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        bio: "这是我的个人简介",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe("这是我的个人简介");
  });

  test("更新为已存在的用户名 - 应返回 409", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        username: testUser2.username,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("用户名");
  });

  test("更新为已存在的邮箱 - 应返回 409", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: testUser2.email,
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("邮箱");
  });

  test("简介超长 - 应返回 422", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        bio: "a".repeat(501),
      });

    expect(res.status).toBe(422);
  });

  test("未认证更新 - 应返回 401", async () => {
    const res = await request(app).put("/api/auth/profile").send({
      bio: "未认证的更新",
    });

    expect(res.status).toBe(401);
  });
});
