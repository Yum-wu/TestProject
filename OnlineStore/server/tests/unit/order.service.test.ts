/**
 * 订单 Service 单元测试
 *
 * 测试 order.service.ts 核心事务流程：创建订单（乐观锁+快照+回滚）、
 * 取消订单（库存恢复）、状态校验、价格快照完整性。
 */

import * as orderService from '../src/services/order.service';
import * as orderModel from '../src/models/order.model';
import * as orderItemModel from '../src/models/orderItem.model';
import * as productModel from '../src/models/product.model';
import * as cartModel from '../src/models/cart.model';
import * as addressModel from '../src/models/address.model';
import { BusinessError } from '../src/utils/errors';
import { RowDataPacket } from 'mysql2';

// ===== Mock 数据库连接池 =====
const mockConnection = {
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
  query: jest.fn(),
};

const mockPool = {
  getConnection: jest.fn().mockResolvedValue(mockConnection),
};

jest.mock('../src/config/db', () => ({
  __esModule: true,
  default: mockPool,
}));

// ===== Mock Model 层 =====
jest.mock('../src/models/order.model');
jest.mock('../src/models/orderItem.model');
jest.mock('../src/models/product.model');
jest.mock('../src/models/cart.model');
jest.mock('../src/models/address.model');

// ===== Mock 订单号生成 =====
jest.mock('../src/utils/orderNo', () => ({
  generateOrderNo: jest.fn().mockReturnValue('202605011200001234'),
}));

// 辅助函数
function mockAddress(overrides = {}) {
  return {
    id: 1, user_id: 1, receiver_name: '张三', phone: '13800138000',
    province: '广东省', city: '深圳市', district: '南山区',
    detail: '科技园路1号', is_default: 1,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function mockCartRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 10, quantity: 2, product_id: 1,
    name: '测试商品', price: 99.00, stock: 10, version: 0,
    image_url: '/img/test.jpg',
    ...overrides,
  };
}

function mockOrder(overrides = {}) {
  return {
    id: 100, order_no: '202605011200001234', user_id: 1,
    address_snapshot: JSON.stringify({ receiver_name: '张三', phone: '13800138000' }),
    total_amount: 198.00, status: 'pending',
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('OrderService - 订单业务逻辑', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 connection mock 返回值
    mockConnection.query.mockReset();
  });

  // ===============================================
  // createOrder - 创建订单
  // ===============================================
  describe('createOrder - 创建订单（事务+乐观锁）', () => {

    it('成功创建订单：完整流程验证', async () => {
      // 安排 mock
      (addressModel.findById as jest.Mock).mockResolvedValue(mockAddress());

      // 购物车查询返回两条数据
      const cartRows = [
        mockCartRow({ id: 10, product_id: 1, price: 99.00, quantity: 2, stock: 10, version: 0 }),
        mockCartRow({ id: 11, product_id: 2, price: 50.00, quantity: 1, stock: 20, version: 0 }),
      ];
      mockConnection.query
        // 第1次: 查购物车
        .mockResolvedValueOnce([cartRows, []])
        // 第2次: 扣库存（第一件商品）
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        // 第3次: 扣库存（第二件商品）
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        // 第4次: INSERT orders
        .mockResolvedValueOnce([{ insertId: 100 } as unknown as RowDataPacket[], []])
        // 第5次: INSERT order_items
        .mockResolvedValueOnce([{ affectedRows: 2 } as unknown as RowDataPacket[], []])
        // 第6次: DELETE cart_items
        .mockResolvedValueOnce([{ affectedRows: 2 } as unknown as RowDataPacket[], []])
        // 第7次: SELECT 回读订单
        .mockResolvedValueOnce([[mockOrder()], []])
        // 第8次: SELECT 回读订单明细
        .mockResolvedValueOnce([[
          { id: 201, product_id: 1, product_name: '测试商品', price: 99.00, quantity: 2, created_at: '2026-01-01T00:00:00Z' },
          { id: 202, product_id: 2, product_name: '商品2', price: 50.00, quantity: 1, created_at: '2026-01-01T00:00:00Z' },
        ], []]);

      const result = await orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [10, 11],
      });

      // 验证事务正确执行
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();

      // 验证订单号生成
      expect(result.order_no).toBe('202605011200001234');

      // 验证价格快照：99*2 + 50*1 = 248
      expect(result.total_amount).toBe(248);

      // 验证商品明细包含 subtotal
      expect(result.items).toHaveLength(2);
      expect(result.items[0].subtotal).toBe(198); // 99 * 2
      expect(result.items[1].subtotal).toBe(50);  // 50 * 1

      // 验证地址快照已 JSON.parse
      expect(typeof result.address_snapshot).toBe('object');
    });

    it('购物车为空时应抛出 2103', async () => {
      await expect(orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [],
      })).rejects.toMatchObject({ code: 2103 });
    });

    it('地址不属于当前用户时应拒绝', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(mockAddress({ user_id: 2 }));

      await expect(orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [10],
      })).rejects.toMatchObject({ code: 2302 });
    });

    it('库存不足时应回滚事务并抛出 2101', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(mockAddress());

      const cartRows = [
        mockCartRow({ id: 10, product_id: 1, quantity: 15, stock: 5 }), // 超出库存
      ];
      mockConnection.query
        .mockResolvedValueOnce([cartRows, []]); // 查购物车

      await expect(orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [10],
      })).rejects.toMatchObject({ code: 2101 });

      // 事务应该回滚
      expect(mockConnection.rollback).toHaveBeenCalled();
      // commit 不应被调用
      expect(mockConnection.commit).not.toHaveBeenCalled();
    });

    it('乐观锁冲突（affectedRows=0）时应回滚并抛出 2203', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(mockAddress());

      const cartRows = [
        mockCartRow({ id: 10, product_id: 1, quantity: 2, stock: 10, version: 0 }),
      ];
      mockConnection.query
        .mockResolvedValueOnce([cartRows, []]) // 查购物车
        .mockResolvedValueOnce([{ affectedRows: 0 } as unknown as RowDataPacket[], []]); // 扣库存失败

      await expect(orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [10],
      })).rejects.toMatchObject({ code: 2203 });

      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it('部分购物车项不属于当前用户时应拒绝', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(mockAddress());

      // 请求 3 个购物车项，但只返回 2 个（第3个不属于该用户）
      const cartRows = [
        mockCartRow({ id: 10, product_id: 1 }),
        mockCartRow({ id: 11, product_id: 2 }),
      ];
      mockConnection.query
        .mockResolvedValueOnce([cartRows, []]);

      await expect(orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [10, 11, 12], // 12 不属于用户
      })).rejects.toMatchObject({ code: 2103 });
    });

    it('价格快照应使用查询时的 prices 字段（非 products 实时查询）', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(mockAddress());

      // 购物车 JOIN 时返回的 price 是快照基准
      const cartRows = [
        mockCartRow({ id: 10, product_id: 1, price: 79.90, quantity: 3, stock: 10, version: 0 }),
      ];
      mockConnection.query
        .mockResolvedValueOnce([cartRows, []])
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        .mockResolvedValueOnce([{ insertId: 100 } as unknown as RowDataPacket[], []])
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        .mockResolvedValueOnce([[mockOrder({ total_amount: 239.70 })], []])
        .mockResolvedValueOnce([[{
          id: 201, product_id: 1, product_name: '测试商品',
          price: 79.90, quantity: 3, created_at: '2026-01-01T00:00:00Z',
        }], []]);

      const result = await orderService.createOrder(1, {
        address_id: 1,
        cart_item_ids: [10],
      });

      // 验证 total_amount = 79.90 * 3 = 239.70
      expect(result.total_amount).toBe(239.70);
      expect(result.items[0].price).toBe(79.90);
    });
  });

  // ===============================================
  // cancelOrder - 取消订单
  // ===============================================
  describe('cancelOrder - 取消订单（事务+库存恢复）', () => {

    it('成功取消 pending 状态订单', async () => {
      mockConnection.query
        // 查订单
        .mockResolvedValueOnce([[mockOrder({ status: 'pending' })], []])
        // 查订单明细
        .mockResolvedValueOnce([[
          { quantity: 2, product_id: 1 },
          { quantity: 1, product_id: 2 },
        ], []])
        // 恢复库存 (第1件)
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        // 恢复库存 (第2件)
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        // 更新订单状态
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []]);

      const result = await orderService.cancelOrder(1, 100);

      expect(result.status).toBe('cancelled');
      expect(result.id).toBe(100);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('订单不存在时应抛出 2201', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[], []]); // 空结果

      await expect(orderService.cancelOrder(1, 999))
        .rejects.toMatchObject({ code: 2201 });
      expect(mockConnection.rollback).toHaveBeenCalled();
    });

    it('非 pending 状态订单取消失败 - 错误码 2202', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[mockOrder({ status: 'cancelled' })], []]);

      await expect(orderService.cancelOrder(1, 100))
        .rejects.toMatchObject({ code: 2202 });
    });

    it('取消他人订单应拒绝（权限校验）', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[mockOrder({ user_id: 2 })], []]);

      await expect(orderService.cancelOrder(1, 100))
        .rejects.toMatchObject({ code: 2201 }); // 保密：返回"不存在"
    });

    it('恢复库存的 quantity 应与订单明细一致', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[mockOrder({ status: 'pending' })], []])
        .mockResolvedValueOnce([[
          { quantity: 5, product_id: 1 },
        ], []])
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []])
        .mockResolvedValueOnce([{ affectedRows: 1 } as unknown as RowDataPacket[], []]);

      await orderService.cancelOrder(1, 100);

      // 验证恢复库存时使用了正确的 quantity
      const stockRestoreCall = mockConnection.query.mock.calls[2];
      expect(stockRestoreCall[1]).toEqual([5, 1]); // [quantity, product_id]
    });
  });

  // ===============================================
  // getOrderById - 订单详情
  // ===============================================
  describe('getOrderById - 订单详情', () => {

    it('权限校验：他人订单返回 2201', async () => {
      (orderModel.findById as jest.Mock).mockResolvedValue(mockOrder({ user_id: 2 }));

      await expect(orderService.getOrderById(1, 100))
        .rejects.toMatchObject({ code: 2201 });
    });

    it('address_snapshot 字符串应被解析为对象', async () => {
      const addrSnapshot = { receiver_name: '张三', phone: '13800138000', province: '粤', city: '深', district: '南山', detail: '路1号' };
      (orderModel.findById as jest.Mock).mockResolvedValue(
        mockOrder({ address_snapshot: JSON.stringify(addrSnapshot) })
      );
      (orderItemModel.findByOrderId as jest.Mock).mockResolvedValue([]);

      const result = await orderService.getOrderById(1, 100);

      expect(typeof result.address_snapshot).toBe('object');
      expect((result.address_snapshot as { receiver_name: string }).receiver_name).toBe('张三');
    });
  });
});
