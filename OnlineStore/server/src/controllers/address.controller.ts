/**
 * 收货地址控制器
 */

import { Request, Response, NextFunction } from 'express';
import { success } from '../utils/response';
import * as addressService from '../services/address.service';

/**
 * POST /api/addresses — 新增地址
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const data = req.body;
    const address = await addressService.createAddress(userId, data);
    success(res, address, 'success', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/addresses — 地址列表
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const addresses = await addressService.getAddresses(userId);
    success(res, addresses);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/addresses/:id — 编辑地址
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const addressId = Number(req.params.id);
    const data = req.body;
    const address = await addressService.updateAddress(userId, addressId, data);
    success(res, address);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/addresses/:id — 删除地址
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.currentUserId!;
    const addressId = Number(req.params.id);
    await addressService.deleteAddress(userId, addressId);
    success(res, null);
  } catch (err) {
    next(err);
  }
}
