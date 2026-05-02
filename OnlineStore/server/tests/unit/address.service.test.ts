/**
 * 地址 Service 单元测试
 *
 * 测试 address.service.ts 的默认地址管理逻辑：
 * - 新增默认地址时清除其他默认
 * - 删除默认地址时自动设置新默认
 * - 编辑地址时的默认标记联动
 * - 权限校验
 */

import * as addressService from '../src/services/address.service';
import * as addressModel from '../src/models/address.model';
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
jest.mock('../src/models/address.model');

// 辅助函数
function makeAddress(overrides: Partial<{
  id: number; user_id: number; receiver_name: string; phone: string;
  province: string; city: string; district: string; detail: string;
  is_default: number;
}> = {}) {
  return {
    id: 1, user_id: 1, receiver_name: '张三', phone: '13800138000',
    province: '广东省', city: '深圳市', district: '南山区',
    detail: '科技园路1号', is_default: 0,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('AddressService - 收货地址业务逻辑', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===============================================
  // createAddress - 新增地址
  // ===============================================
  describe('createAddress - 新增地址', () => {

    it('新增非默认地址不应清除其他默认', async () => {
      (addressModel.create as jest.Mock).mockResolvedValue(5);
      (addressModel.findById as jest.Mock).mockResolvedValue(makeAddress({ id: 5 }));

      await addressService.createAddress(1, {
        receiver_name: '李四', phone: '13900139000',
        province: '广东省', city: '广州市', district: '天河区',
        detail: '天河路100号', is_default: false,
      });

      // 不应清除其他默认地址
      expect(addressModel.clearDefault).not.toHaveBeenCalled();
    });

    it('新增默认地址应先清除其他默认标记', async () => {
      (addressModel.clearDefault as jest.Mock).mockResolvedValue(undefined);
      (addressModel.create as jest.Mock).mockResolvedValue(5);
      (addressModel.findById as jest.Mock).mockResolvedValue(
        makeAddress({ id: 5, is_default: 1 })
      );

      const result = await addressService.createAddress(1, {
        receiver_name: '李四', phone: '13900139000',
        province: '广东省', city: '广州市', district: '天河区',
        detail: '天河路100号', is_default: true,
      });

      // 验证先清除，后创建
      expect(addressModel.clearDefault).toHaveBeenCalledWith(1);
      expect(addressModel.create).toHaveBeenCalled();
      expect(result.is_default).toBe(1);
    });
  });

  // ===============================================
  // updateAddress - 编辑地址
  // ===============================================
  describe('updateAddress - 编辑地址', () => {

    it('编辑地址基本信息应成功', async () => {
      const existingAddress = makeAddress({ id: 5, receiver_name: '张三' });
      (addressModel.findById as jest.Mock)
        .mockResolvedValueOnce(existingAddress)   // 第一次: 校验存在
        .mockResolvedValueOnce(makeAddress({ id: 5, receiver_name: '张三丰' })); // 第二次: 回读
      (addressModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await addressService.updateAddress(1, 5, {
        receiver_name: '张三丰',
      });

      expect(addressModel.update).toHaveBeenCalledWith(5, { receiver_name: '张三丰' });
      expect(result.receiver_name).toBe('张三丰');
    });

    it('将地址设为默认时应清除其他默认', async () => {
      const existingAddress = makeAddress({ id: 5, is_default: 0 });
      (addressModel.findById as jest.Mock)
        .mockResolvedValueOnce(existingAddress)
        .mockResolvedValueOnce(makeAddress({ id: 5, is_default: 1 }));
      (addressModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await addressService.updateAddress(1, 5, {
        is_default: true,
      });

      expect(addressModel.clearDefault).toHaveBeenCalledWith(1);
      expect(result.is_default).toBe(1);
    });

    it('取消默认地址时不应自动设置其他默认', async () => {
      // PRD: 从 true 改为 false 时，不自动设置其他为默认
      const existingAddress = makeAddress({ id: 5, is_default: 1 });
      (addressModel.findById as jest.Mock)
        .mockResolvedValueOnce(existingAddress)
        .mockResolvedValueOnce(makeAddress({ id: 5, is_default: 0 }));
      (addressModel.update as jest.Mock).mockResolvedValue(undefined);

      const result = await addressService.updateAddress(1, 5, {
        is_default: false,
      });

      // 取消默认时不应清除其他默认标记
      expect(addressModel.clearDefault).not.toHaveBeenCalled();
      expect(result.is_default).toBe(0);
    });

    it('地址不存在时应抛出 2301', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(addressService.updateAddress(1, 999, { receiver_name: 'x' }))
        .rejects.toMatchObject({ code: 2301 });
    });

    it('无权编辑他人地址时应拒绝', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(makeAddress({ user_id: 2 }));

      await expect(addressService.updateAddress(1, 5, { receiver_name: 'x' }))
        .rejects.toMatchObject({ code: 2301 }); // 保密：不暴露地址存在
    });
  });

  // ===============================================
  // deleteAddress - 删除地址
  // ===============================================
  describe('deleteAddress - 删除地址', () => {

    it('删除非默认地址成功', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(makeAddress({ is_default: 0 }));
      (addressModel.deleteById as jest.Mock).mockResolvedValue(1);

      await expect(addressService.deleteAddress(1, 5)).resolves.toBeUndefined();

      // 不应尝试设置新默认
      expect(addressModel.findFirstByUserId).not.toHaveBeenCalled();
      expect(addressModel.setDefault).not.toHaveBeenCalled();
    });

    it('删除默认地址应自动将剩余第一个设为默认', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(makeAddress({ is_default: 1 }));
      (addressModel.deleteById as jest.Mock).mockResolvedValue(1);
      (addressModel.findFirstByUserId as jest.Mock).mockResolvedValue(
        makeAddress({ id: 3, is_default: 0 })
      );
      (addressModel.setDefault as jest.Mock).mockResolvedValue(undefined);

      await addressService.deleteAddress(1, 5);

      // 删除后应查询第一个剩余地址
      expect(addressModel.findFirstByUserId).toHaveBeenCalledWith(1);
      // 设为默认
      expect(addressModel.setDefault).toHaveBeenCalledWith(3);
    });

    it('删除唯一默认地址时无剩余地址可设默认', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(makeAddress({ is_default: 1 }));
      (addressModel.deleteById as jest.Mock).mockResolvedValue(1);
      (addressModel.findFirstByUserId as jest.Mock).mockResolvedValue(null); // 无剩余

      await addressService.deleteAddress(1, 5);

      // findFirstByUserId 被调用但 setDefault 不应被调用
      expect(addressModel.findFirstByUserId).toHaveBeenCalled();
      expect(addressModel.setDefault).not.toHaveBeenCalled();
    });

    it('地址不存在时应抛出 2301', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(addressService.deleteAddress(1, 999))
        .rejects.toMatchObject({ code: 2301 });
    });

    it('无权删除他人地址时应拒绝', async () => {
      (addressModel.findById as jest.Mock).mockResolvedValue(makeAddress({ user_id: 2 }));

      await expect(addressService.deleteAddress(1, 5))
        .rejects.toMatchObject({ code: 2301 });
    });
  });

  // ===============================================
  // getAddresses - 地址列表
  // ===============================================
  describe('getAddresses - 地址列表', () => {

    it('应返回按默认地址置顶排序的列表', async () => {
      (addressModel.findByUserId as jest.Mock).mockResolvedValue([
        makeAddress({ id: 1, is_default: 1 }),
        makeAddress({ id: 2, is_default: 0 }),
      ]);

      const result = await addressService.getAddresses(1);

      expect(result).toHaveLength(2);
      // Model 层已按 ORDER BY is_default DESC 排序
      expect(result[0].is_default).toBe(1);
    });

    it('无地址时返回空数组', async () => {
      (addressModel.findByUserId as jest.Mock).mockResolvedValue([]);

      const result = await addressService.getAddresses(1);
      expect(result).toEqual([]);
    });
  });
});
