const slugify = require("slugify");

/**
 * 生成 slug（URL 友好的字符串）
 * @param {string} text - 原始文本
 * @returns {string} slug 字符串
 */
function generateSlug(text) {
  return slugify(text, {
    lower: true, // 转为小写
    strict: true, // 移除特殊字符
    locale: "zh", // 中文 locale
  });
}

/**
 * 生成唯一 slug（避免重复）
 * @param {string} text - 原始文本
 * @param {Function} checkExists - 检查 slug 是否已存在的异步函数
 * @returns {Promise<string>} 唯一的 slug
 */
async function generateUniqueSlug(text, checkExists) {
  let slug = generateSlug(text);

  // 如果 slug 为空（纯中文可能生成空字符串），使用时间戳
  if (!slug) {
    slug = `post-${Date.now()}`;
  }

  // 检查是否已存在
  let exists = await checkExists(slug);
  let counter = 1;

  while (exists) {
    slug = `${generateSlug(text)}-${counter}`;
    if (!slug || slug === `-${counter}`) {
      slug = `post-${Date.now()}-${counter}`;
    }
    exists = await checkExists(slug);
    counter++;
  }

  return slug;
}

module.exports = { generateSlug, generateUniqueSlug };
