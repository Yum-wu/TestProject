/**
 * 统一响应格式工具
 */

/**
 * 成功响应
 * @param {object} res - Express 响应对象
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} statusCode - HTTP 状态码
 */
function success(res, data = null, message = "操作成功", statusCode = 200) {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data,
  });
}

/**
 * 错误响应
 * @param {object} res - Express 响应对象
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP 状态码
 * @param {*} errors - 详细错误信息
 */
function error(res, message = "操作失败", statusCode = 400, errors = null) {
  const response = {
    code: statusCode,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

/**
 * 分页响应
 * @param {object} res - Express 响应对象
 * {Array} items - 数据列表
 * {number} total - 总记录数
 * {number} page - 当前页码
 * {number} pageSize - 每页条数
 * @param {string} message - 响应消息
 */
function paginate(res, { items, total, page, pageSize }, message = "查询成功") {
  const totalPages = Math.ceil(total / pageSize);
  return res.status(200).json({
    code: 200,
    message,
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
    },
  });
}

module.exports = { success, error, paginate };
