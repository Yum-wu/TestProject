import { useState, useCallback } from 'react';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from '../services/address.api';
import type { Address, CreateAddressInput, UpdateAddressInput } from '../types/address';

/**
 * 收货地址 Hook
 * 管理地址列表与增删改操作
 */
export function useAddresses() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  /**
   * 刷新地址列表
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAddresses();
      // 默认地址置顶
      list.sort((a, b) => b.is_default - a.is_default);
      setAddresses(list);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 新增地址
   */
  const addAddress = useCallback(
    async (input: CreateAddressInput) => {
      setLoading(true);
      try {
        await createAddress(input);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  /**
   * 编辑地址
   */
  const editAddress = useCallback(
    async (id: number, input: UpdateAddressInput) => {
      setLoading(true);
      try {
        await updateAddress(id, input);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  /**
   * 删除地址
   */
  const removeAddress = useCallback(
    async (id: number) => {
      setLoading(true);
      try {
        await deleteAddress(id);
        await refresh();
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  return { loading, addresses, addAddress, editAddress, removeAddress, refresh };
}
