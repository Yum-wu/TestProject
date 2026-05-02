/**
 * API 集成测试
 *
 * 测试完整业务流程：商品浏览 → 加入购物车 → 创建订单 → 取消订单，以及地址 CRUD。
 * 使用 supertest 模拟 HTTP 请求 + mock 数据库连接层。
 */

import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/db';

// ===== Mock 数据库连接池 =====
jest.mock('../src/config/db', () => {
  const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
    query: jest.fn(),
  };

  const mockPool = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    query: jest.fn(),
    execute: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockPool,
    mockConnection,
    mockPool,
  };
});

const mockPoolObj = pool as jest.Mocked<typeof pool> & { query: jest.Mock };
const mockConn = (pool as unknown as { getConnection: jest.Mock }).getConnection;

// 获取 mock connection 实例
function getMockConn() {
  return mockConn.mock.results?.[mockConn.mock.results.length - 1]?.value;
}

// ===== Mock 订单号生成 =====
jest.mock('../src/utils/orderNo', () => ({
  generateOrderNo: jest.fn().mockReturnValue('202605011200001234'),
}));

describe('API 集成测试', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===============================================
  // 商品 API
  // ===============================================
  describe('GET /api/products - 商品列表（分页）', () => {

    it('应返回分页商品列表', async () => {
      mockPoolObj.query
        // 查数据
        .mockResolvedValueOnce([[
          { id: 1, name: '无线蓝牙耳机', price: 299.00, stock: 95, category: '电子产品', image_url: '/img/1.jpg', created_at: '2026-04-01T00:00:00Z' },
          { id: 2, name: '纯棉T恤', price: 79.90, stock: 200, category: '服装', image_url: '/img/2.jpg', created_at: '2026-04-02T00:00:00Z' },
        ], []])
        // 查总数
        .mockResolvedValueOnce([[{ total: 2 }], []]);

      const res = await request(app)
        .get('/api/products?page=1&pageSize=20');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list).toHaveLength(2);
      expect(res.body.data.pagination).toEqual({
        page: 1, pageSize: 20, total: 2, totalPages: 1,
      });
    });

    it('category 筛选应传入 SQL', async () => {
      mockPoolObj.query
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ total: 0 }], []]);

      await request(app)
        .get('/api/products?category=电子产品');

      // 验证 SQL 包含 WHERE category = ?
      const calledSql = (mockPoolObj.query as jest.Mock).mock.calls[0][0] as string;
      expect(calledSql).toContain('category = ?');
    });

    it('keyword 搜索应传入 LIKE 查询', async () => {
      mockPoolObj.query
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ total: 0 }], []]);

      await request(app)
        .get('/api/products?keyword=耳机');

      const calledSql = (mockPoolObj.query as jest.Mock).mock.calls[0][0] as string;
      expect(calledSql).toContain('name LIKE');
    });

    it('sort 参数应传入 ORDER BY 子句', async () => {
      mockPoolObj.query
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ total: 0 }], []]);

      await request(app)
        .get('/api/products?sort=price_asc');

      const calledSql = (mockPoolObj.query as jest.Mock).mock.calls[0][0] as string;
      expect(calledSql).toContain('ORDER BY price ASC');
    });

    it('pageSize 超过最大值应被限制', async () => {
      mockPoolObj.query
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ total: 0 }], []]);

      await request(app)
        .get('/api/products?pageSize=200');

      const params = (mockPoolObj.query as jest.Mock).mock.calls[0][1];
      // pasePagination 应将 pageSize 限制在 maxPageSize(默认为 100)
      expect(params[params.length - 2]).toBeLessThanOrEqual(100);
    });
  });

  // ===============================================
  // 商品详情 API
  // ===============================================
  describe('GET /api/products/:id - 商品详情', () => {

    it('商品存在时返回详情数据', async () => {
      mockPoolObj.query
        .mockResolvedValueOnce([[
          { id: 1, name: '无线蓝牙耳机', description: '高品质降噪', price: 299.00,
            stock: 95, category: '电子产品', image_url: '/img/1.jpg', version: 0,
            created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-20T00:00:00Z' },
        ], []]);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.name).toBe('无线蓝牙耳机');
      expect(res.body.data.description).toBeDefined();
    });

    it('商品不存在时返回 2001', async () => {
      mockPoolObj.query.mockResolvedValueOnce([[], []]);

      const res = await request(app).get('/api/products/999');

      expect(res.body.code).toBe(2001);
    });
  });

  // ===============================================
  // 购物车 API（需要认证）
  // ===============================================
  describe('购物车 API - 认证保护', () => {

    it('未携带 Token 应返回 4001 或 4002', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ product_id: 1, quantity: 1 });

      expect(res.body.code).toBeGreaterThanOrEqual(4001);
    });

    it('无效 Token 应返回 4002', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer invalid-token')
        .send({ product_id: 1, quantity: 1 });

      expect(res.body.code).toBe(4002);
    });
  });

  // ===============================================
  // POST /api/cart - 完整加购流程
  // ===============================================
  describe('POST /api/cart - 加入购物车', () => {

    it('有效 Token + 合法参数应成功加购', async () => {
      // 查商品存在
      mockPoolObj.query
        .mockResolvedValueOnce([[
          { id: 1, name: '测试商品', description: '描述', price: 99.00,
            stock: 10, category: '电子产品', image_url: '', version: 0,
            created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
        ], []])
        // 查购物车已有记录
        .mockResolvedValueOnce([[], []])
        // INSERT cart_items
        .mockResolvedValueOnce([{ insertId: 20, affectedRows: 1 }, []]);

      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer test-token-user-1')
        .send({ product_id: 1, quantity: 2 });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toBeDefined();
    });

    it('缺少必填字段应返回校验错误', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer test-token-user-1')
        .send({ product_id: 1 }); // 缺少 quantity

      // Joi 校验应返回 1001
      expect(res.body.code).toBe(1001);
    });
  });

  // ===============================================
  // 完整下单流程：加购 → 下单 → 取消
  // ===============================================
  describe('完整下单流程（集成）', () => {

    it('加购 → 创建订单 → 取消订单完整闭环', async () => {
      // ---- Step 1: 创建订单 ----
      const conn = getMockConn?.() ?? {};
      // 地址查询
      mockPoolObj.query
        .mockResolvedValueOnce([[
          { id: 1, user_id: 1, receiver_name: '张三', phone: '13800138000',
            province: '广东', city: '深圳', district: '南山', detail: '路1号', is_default: 1,
            created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
        ], []]);

      // Connection query 序列
      if (conn && typeof (conn as Record<string, unknown>).query === 'function') {
        const connQuery = (conn as { query: jest.Mock }).query;
        connQuery
          .mockResolvedValueOnce([[
            { id: 10, quantity: 2, product_id: 1, name: '测试商品', price: 99.00,
              stock: 10, version: 0, image_url: '' }
          ], []])
          .mockResolvedValueOnce([{ affectedRows: 1 }, []])
          .mockResolvedValueOnce([{ insertId: 200 }, []])
          .mockResolvedValueOnce([{ affectedRows: 1 }, []])
          .mockResolvedValueOnce([{ affectedRows: 1 }, []])
          .mockResolvedValueOnce([[
            { id: 200, order_no: '202605011200001234', user_id: 1,
              address_snapshot: '{"receiver_name":"张三"}', total_amount: 198.00,
              status: 'pending', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
          ], []])
          .mockResolvedValueOnce([[
            { id: 301, product_id: 1, product_name: '测试商品', price: 99.00,
              quantity: 2, created_at: '2026-01-01T00:00:00Z' }
          ], []]);
      }

      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer test-token-user-1')
        .send({ address_id: 1, cart_item_ids: [10] });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.code).toBe(0);
      expect(orderRes.body.data.order_no).toBe('202605011200001234');

      // ---- Step 2: 订单详情 ----
      mockPoolObj.query
        .mockResolvedValueOnce([[
          { id: 200, order_no: '202605011200001234', user_id: 1,
            address_snapshot: '{"receiver_name":"张三","phone":"13800138000","province":"粤","city":"深","district":"南山","detail":"路1号"}',
            total_amount: 198.00, status: 'pending',
            created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
        ], []])
        .mockResolvedValueOnce([[
          { id: 301, order_id: 200, product_id: 1, product_name: '测试商品',
            product_image: '', price: 99.00, quantity: 2, created_at: '2026-01-01T00:00:00Z' }
        ], []]);

      const detailRes = await request(app)
        .get('/api/orders/200')
        .set('Authorization', 'Bearer test-token-user-1');

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.status).toBe('pending');
      expect(detailRes.body.data.items).toHaveLength(1);

      // ---- Step 3: 取消订单 ----
      if (conn && typeof (conn as Record<string, unknown>).query === 'function') {
        const connQuery = (conn as { query: jest.Mock }).query;
        connQuery.mockReset();
        connQuery
          .mockResolvedValueOnce([[
            { id: 200, status: 'pending', user_id: 1, order_no: '202605011200001234',
              address_snapshot: '{}', total_amount: 198.00, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
          ], []])
          .mockResolvedValueOnce([[
            { quantity: 2, product_id: 1 }
          ], []])
          .mockResolvedValueOnce([{ affectedRows: 1 }, []])
          .mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      }

      const cancelRes = await request(app)
        .patch('/api/orders/200/cancel')
        .set('Authorization', 'Bearer test-token-user-1');

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('cancelled');
    });
  });

  // ===============================================
  // 地址 CRUD API
  // ===============================================
  describe('地址 CRUD API', () => {

    it('POST /api/addresses - 新增地址', async () => {
      mockPoolObj.query
        // INSERT
        .mockResolvedValueOnce([{ insertId: 10 }, []])
        // SELECT 回读
        .mockResolvedValueOnce([[
          { id: 10, user_id: 1, receiver_name: '王五', phone: '13800138000',
            province: '北京', city: '北京', district: '朝阳', detail: '路5号',
            is_default: 0, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
        ], []]);

      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', 'Bearer test-token-user-1')
        .send({
          receiver_name: '王五', phone: '13800138000',
          province: '北京', city: '北京', district: '朝阳',
          detail: '路5号', is_default: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.receiver_name).toBe('王五');
    });

    it('GET /api/addresses - 地址列表', async () => {
      mockPoolObj.query
        .mockResolvedValueOnce([[
          { id: 1, user_id: 1, receiver_name: '张三', phone: '13800138000',
            province: '广东', city: '深圳', district: '南山', detail: '路1号',
            is_default: 1, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
        ], []]);

      const res = await request(app)
        .get('/api/addresses')
        .set('Authorization', 'Bearer test-token-user-1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('PUT /api/addresses/:id - 编辑地址', async () => {
      mockPoolObj.query
        // 查原地址
        .mockResolvedValueOnce([[
          { id: 10, user_id: 1, receiver_name: '王五', phone: '13800138000',
            province: '北京', city: '北京', district: '朝阳', detail: '路5号',
            is_default: 0, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
        ], []])
        // UPDATE
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        // 回读
        .mockResolvedValueOnce([[
          { id: 10, user_id: 1, receiver_name: '王五五', phone: '13800138000',
            province: '北京', city: '北京', district: '朝阳', detail: '路5号',
            is_default: 0, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
        ], []]);

      const res = await request(app)
        .put('/api/addresses/10')
        .set('Authorization', 'Bearer test-token-user-1')
        .send({ receiver_name: '王五五' });

      expect(res.status).toBe(200);
      expect(res.body.data.receiver_name).toBe('王五五');
    });

    it('DELETE /api/addresses/:id - 删除地址', async () => {
      mockPoolObj.query
        // 查原地址
        .mockResolvedValueOnce([[
          { id: 10, user_id: 1, receiver_name: '王五', phone: '13800138000',
            province: '北京', city: '北京', district: '朝阳', detail: '路5号',
            is_default: 0, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
        ], []])
        // DELETE
        .mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const res = await request(app)
        .delete('/api/addresses/10')
        .set('Authorization', 'Bearer test-token-user-1');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    it('手机号格式错误时应返回校验错误', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', 'Bearer test-token-user-1')
        .send({
          receiver_name: '王五', phone: '12345', // 非法手机号
          province: '北京', city: '北京', district: '朝阳',
          detail: '路5号', is_default: false,
        });

      // Joi 校验应返回 1001
      expect(res.body.code).toBe(1001);
    });
  });

  // ===============================================
  // 健康检查
  // ===============================================
  describe('GET /health - 健康检查', () => {

    it('应返回服务状态 ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // ===============================================
  // 404 处理
  // ===============================================
  describe('404 兜底处理', () => {

    it('访问不存在的路由应返回 404 + code 3003', async () => {
      const res = await request(app).get('/non-existent-path');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe(3003);
    });
  });
});
