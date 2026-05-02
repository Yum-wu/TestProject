/**
 * 购物车 Service 单元测试
 *
 * 测试 cart.service.ts 所有核心业务逻辑，使用 Jest mock 替代数据库连接。
 * 覆盖：添加商品、累加已存在商品、库存不足拒绝、删除、修改数量、权限校验。
 */

import * as cartService from '../src/services/cart.service';
import * as cartModel from '../src/models/cart.model';
import * as productModel from '../src/models/product.model';
import { BusinessError } from '../src/utils/errors';

// ===== Mock 数据库连接池 =====
jest.mock('../src/config/db', () => ({
  __esModule: true,
  default: {
    getConnection: jest.fn(),
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

// ===== Mock Model 层 =====
jest.mock('../src/models/cart.model');
jest.mock('../src/models/product.model');

// 辅助：快速创建商品 mock 数据
function makeProduct(overrides: Partial<{
  id: number; name: string; price: number; stock: number; description: string;
  category: string; image_url: string; version: number;
}> = {}) {
  return {
    id: 1, name: '测试商品', price: 99.00, stock: 10, description: '描述',
    category: '电子产品', image_url: '/img/test.jpg', version: 0,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeCartItem(overrides: Partial<{
  id: number; user_id: number; product_id: number; quantity: number;
}> = {}) {
  return {
    id: 1, user_id: 1, product_id: 1, quantity: 2,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('CartService - 购物车业务逻辑', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===============================================
  // 场景 1: 添加商品到空购物车
  // ===============================================
  describe('addToCart - 添加商品到购物车', () => {

    it('首次添加商品到空购物车应成功', async () => {
      const product = makeProduct({ id: 1, stock: 10 });
      (productModel.findById as jest.Mock).mockResolvedValue(product);
      (cartModel.findByUserAndProduct as jest.Mock).mockResolvedValue(null); // 无已有记录
      (cartModel.create as jest.Mock).mockResolvedValue(makeCartItem({ id: 10, quantity: 3 }));

      const result = await cartService.addToCart(1, 1, 3);

      expect(productModel.findById).toHaveBeenCalledWith(1);
      expect(cartModel.findByUserAndProduct).toHaveBeenCalledWith(1, 1);
      expect(cartModel.create).toHaveBeenCalledWith({
        user_id: 1, product_id: 1, quantity: 3,
      });
      expect(result.quantity).toBe(3);
      expect(result.id).toBe(10);
    });

    it('商品不存在时应抛出 BusinessError 2001', async () => {
      (productModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(cartService.addToCart(1, 999, 1))
        .rejects.toThrow(BusinessError);
      await expect(cartService.addToCart(1, 999, 1))
        .rejects.toMatchObject({ code: 2001 });
    });

    // ===============================================
    // 场景 2: 累加已存在商品
    // ===============================================
    it('已存在商品应累加数量', async () => {
      const product = makeProduct({ id: 1, stock: 20 });
      const existing = makeCartItem({ id: 5, quantity: 4, product_id: 1 });
      (productModel.findById as jest.Mock).mockResolvedValue(product);
      (cartModel.findByUserAndProduct as jest.Mock).mockResolvedValue(existing);
      (cartModel.updateQuantity as jest.Mock).mockResolvedValue(undefined);

      const result = await cartService.addToCart(1, 1, 3);

      expect(cartModel.updateQuantity).toHaveBeenCalledWith(5, 7); // 4 + 3 = 7
      expect(result.quantity).toBe(7); // 累加后数量
    });

    it('累加后超过库存应拒绝 - 错误码 2101', async () => {
      const product = makeProduct({ id: 1, stock: 5 });
      const existing = makeCartItem({ id: 5, quantity: 4, product_id: 1 });
      (productModel.findById as jest.Mock).mockResolvedValue(product);
      (cartModel.findByUserAndProduct as jest.Mock).mockResolvedValue(existing);

      await expect(cartService.addToCart(1, 1, 3)) // 4 + 3 = 7 > 5
        .rejects.toMatchObject({ code: 2101 });
    });

    // ===============================================
    // 场景 3: 库存不足时拒绝
    // ===============================================
    it('新增商品数量超过库存应拒绝 - 错误码 2101', async () => {
      const product = makeProduct({ id: 1, stock: 3 });
      (productModel.findById as jest.Mock).mockResolvedValue(product);
      (cartModel.findByUserAndProduct as jest.Mock).mockResolvedValue(null);

      await expect(cartService.addToCart(1, 1, 5)) // 5 > 3
        .rejects.toMatchObject({ code: 2101 });
    });

    it('数量为 0 时 Joi 校验层应拦截（service 层不处理）', async () => {
      // 此场景由 validator 中间件处理，service 层假设输入合法
      // 验证 service 在极端输入下不会崩溃
      const product = makeProduct({ id: 1, stock: 10 });
      (productModel.findById as jest.Mock).mockResolvedValue(product);
      (cartModel.findByUserAndProduct as jest.Mock).mockResolvedValue(null);
      (cartModel.create as jest.Mock).mockResolvedValue(makeCartItem({ quantity: 0 }));

      const result = await cartService.addToCart(1, 1, 0);
      // 不会崩溃，存储由数据库唯一约束保证
      expect(result).toBeDefined();
    });
  });

  // ===============================================
  // 场景 4: 修改购物车数量
  // ===============================================
  describe('updateCartItem - 修改购物车项数量', () => {

    it('修改数量为新值应成功', async () => {
      const cartItem = makeCartItem({ id: 10, quantity: 2, user_id: 1 });
      const product = makeProduct({ id: 1, stock: 20 });
      (cartModel.findById as jest.Mock).mockResolvedValue(cartItem);
      (productModel.findById as jest.Mock).mockResolvedValue(product);
      (cartModel.updateQuantity as jest.Mock).mockResolvedValue(undefined);

      const result = await cartService.updateCartItem(1, 10, 5);

      expect(cartModel.updateQuantity).toHaveBeenCalledWith(10, 5);
      expect(result.quantity).toBe(5);
    });

    it('购物车项不存在时应抛出 2102', async () => {
      (cartModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(cartService.updateCartItem(1, 999, 1))
        .rejects.toMatchObject({ code: 2102 });
    });

    it('无权操作他人购物车项时应抛出 4003', async () => {
      const cartItem = makeCartItem({ id: 10, user_id: 2 }); // 属于用户 2
      (cartModel.findById as jest.Mock).mockResolvedValue(cartItem);

      await expect(cartService.updateCartItem(1, 10, 5))
        .rejects.toMatchObject({ code: 4003 });
    });

    it('修改后数量超过库存应拒绝 - 错误码 2101', async () => {
      const cartItem = makeCartItem({ id: 10, quantity: 2, user_id: 1 });
      const product = makeProduct({ id: 1, stock: 3 });
      (cartModel.findById as jest.Mock).mockResolvedValue(cartItem);
      (productModel.findById as jest.Mock).mockResolvedValue(product);

      await expect(cartService.updateCartItem(1, 10, 5)) // 5 > 3
        .rejects.toMatchObject({ code: 2101 });
    });
  });

  // ===============================================
  // 场景 5: 删除购物车项
  // ===============================================
  describe('removeCartItem - 删除购物车项', () => {

    it('删除自己的购物车项应成功', async () => {
      const cartItem = makeCartItem({ id: 10, user_id: 1 });
      (cartModel.findById as jest.Mock).mockResolvedValue(cartItem);
      (cartModel.deleteById as jest.Mock).mockResolvedValue(1);

      await expect(cartService.removeCartItem(1, 10)).resolves.toBeUndefined();
      expect(cartModel.deleteById).toHaveBeenCalledWith(10);
    });

    it('购物车项不存在时应抛出 2102', async () => {
      (cartModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(cartService.removeCartItem(1, 999))
        .rejects.toMatchObject({ code: 2102 });
    });

    it('删除他人购物车项时应抛出 4003', async () => {
      const cartItem = makeCartItem({ id: 10, user_id: 2 });
      (cartModel.findById as jest.Mock).mockResolvedValue(cartItem);

      await expect(cartService.removeCartItem(1, 10))
        .rejects.toMatchObject({ code: 4003 });
    });
  });

  // ===============================================
  // 场景 6: 查看购物车汇总
  // ===============================================
  describe('getCart - 查询购物车', () => {

    it('购物车为空时返回空列表', async () => {
      (cartModel.findByUserId as jest.Mock).mockResolvedValue([]);

      const result = await cartService.getCart(1);

      expect(result.items).toEqual([]);
      expect(result.total_amount).toBe(0);
      expect(result.total_count).toBe(0);
    });

    it('购物车有商品时正确计算总金额', async () => {
      (cartModel.findByUserId as jest.Mock).mockResolvedValue([
        { subtotal: 99.00 },
        { subtotal: 198.50 },
        { subtotal: 50.00 },
      ]);

      const result = await cartService.getCart(1);

      expect(result.total_amount).toBe(347.50);
      expect(result.total_count).toBe(3);
    });
  });
});
