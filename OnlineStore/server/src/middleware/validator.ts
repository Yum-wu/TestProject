/**
 * 请求参数校验中间件工厂函数
 *
 * 基于 Joi schema 对 req.body / req.query / req.params 进行校验。
 * 校验失败直接抛出 ValidationError，由 errorHandler 统一处理。
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

/** 校验目标 */
interface ValidationSchemas {
  /** 请求体校验 schema */
  body?: Joi.ObjectSchema;
  /** 查询参数校验 schema */
  query?: Joi.ObjectSchema;
  /** 路径参数校验 schema */
  params?: Joi.ObjectSchema;
}

/**
 * 创建校验中间件
 *
 * @param schemas 校验规则集合
 * @returns Express 中间件函数
 *
 * @example
 * ```ts
 * router.post('/', validate({ body: addToCartSchema }), controller.add);
 * ```
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // 校验 body
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, {
          abortEarly: false,       // 返回所有错误而非第一个
          stripUnknown: true,      // 去除未定义字段
        });
        if (error) {
          const msg = error.details.map((d: Joi.ValidationErrorItem) => d.message).join('; ');
          throw new ValidationError(1001, `参数校验失败: ${msg}`);
        }
        req.body = value;
      }

      // 校验 query
      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const msg = error.details.map((d: Joi.ValidationErrorItem) => d.message).join('; ');
          throw new ValidationError(1002, `查询参数校验失败: ${msg}`);
        }
        req.query = value;
      }

      // 校验 params
      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const msg = error.details.map((d: Joi.ValidationErrorItem) => d.message).join('; ');
          throw new ValidationError(1002, `路径参数校验失败: ${msg}`);
        }
        req.params = value;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// ============================================
// 预定义 Joi Schema（各路由共用）
// ============================================

/** 手机号正则：中国大陆 1[3-9] + 9 位数字 */
const PHONE_REGEX = /^1[3-9]\d{9}$/;

/** 新增地址 Schema */
export const createAddressSchema = Joi.object({
  receiver_name: Joi.string().min(1).max(50).required().messages({
    'string.empty': '收货人姓名不能为空',
    'string.max': '收货人姓名不能超过 50 个字符',
    'any.required': '收货人姓名是必填项',
  }),
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': '请输入正确的手机号',
    'any.required': '联系电话是必填项',
  }),
  province: Joi.string().min(1).max(50).required().messages({
    'string.empty': '省份不能为空',
    'any.required': '省份是必填项',
  }),
  city: Joi.string().min(1).max(50).required().messages({
    'string.empty': '城市不能为空',
    'any.required': '城市是必填项',
  }),
  district: Joi.string().min(1).max(50).required().messages({
    'string.empty': '区/县不能为空',
    'any.required': '区/县是必填项',
  }),
  detail: Joi.string().min(1).max(200).required().messages({
    'string.empty': '详细地址不能为空',
    'string.max': '详细地址不能超过 200 个字符',
    'any.required': '详细地址是必填项',
  }),
  is_default: Joi.boolean().default(false),
});

/** 更新地址 Schema */
export const updateAddressSchema = Joi.object({
  receiver_name: Joi.string().min(1).max(50).messages({
    'string.max': '收货人姓名不能超过 50 个字符',
  }),
  phone: Joi.string().pattern(PHONE_REGEX).messages({
    'string.pattern.base': '请输入正确的手机号',
  }),
  province: Joi.string().min(1).max(50),
  city: Joi.string().min(1).max(50),
  district: Joi.string().min(1).max(50),
  detail: Joi.string().min(1).max(200).messages({
    'string.max': '详细地址不能超过 200 个字符',
  }),
  is_default: Joi.boolean(),
});

/** 添加购物车 Schema */
export const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required().messages({
    'number.base': '商品 ID 必须是数字',
    'number.positive': '商品 ID 必须是正整数',
    'any.required': '商品 ID 是必填项',
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.base': '数量必须是数字',
    'number.positive': '数量必须是正整数',
    'any.required': '数量是必填项',
  }),
});

/** 更新购物车数量 Schema */
export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().positive().required().messages({
    'number.base': '数量必须是数字',
    'number.positive': '数量必须是正整数',
    'any.required': '数量是必填项',
  }),
});

/** 创建订单 Schema */
export const createOrderSchema = Joi.object({
  address_id: Joi.number().integer().positive().required().messages({
    'number.base': '地址 ID 必须是数字',
    'number.positive': '地址 ID 必须是正整数',
    'any.required': '地址 ID 是必填项',
  }),
  cart_item_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': '至少需要选择一个购物车项',
      'any.required': '购物车项 ID 列表是必填项',
    }),
});

/** 路径参数 ID 校验（复用） */
export const idParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID 必须是数字',
    'number.positive': 'ID 必须是正整数',
    'any.required': 'ID 是必填项',
  }),
});
