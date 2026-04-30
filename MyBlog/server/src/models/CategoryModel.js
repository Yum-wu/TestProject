const { execute } = require("../config/database");

/**
 * 分类模型 - 分类 CRUD 操作
 */
const CategoryModel = {
  /**
   * 创建分类
   * @param {object} data - { name, slug, description }
   * @returns {object} 新分类信息
   */
  async create({ name, slug, description = null }) {
    const result = await execute(
      "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
      [name, slug, description],
    );
    return this.findById(result.insertId);
  },

  /**
   * 根据 ID 查找分类
   * @param {number} id - 分类 ID
   * @returns {object|null} 分类信息
   */
  async findById(id) {
    const rows = await execute("SELECT * FROM categories WHERE id = ?", [id]);
    return rows[0] || null;
  },

  /**
   * 根据 slug 查找分类
   * @param {string} slug - 分类 slug
   * @returns {object|null} 分类信息
   */
  async findBySlug(slug) {
    const rows = await execute("SELECT * FROM categories WHERE slug = ?", [
      slug,
    ]);
    return rows[0] || null;
  },

  /**
   * 获取所有分类（含文章数量）
   * @returns {Array} 分类列表
   */
  async findAll() {
    return execute(
      `SELECT c.*, COUNT(p.id) AS post_count
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.created_at ASC`,
    );
  },

  /**
   * 更新分类
   * @param {number} id - 分类 ID
   * @param {object} data - 更新字段
   * @returns {object|null} 更新后的分类
   */
  async update(id, { name, slug, description }) {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (slug !== undefined) {
      fields.push("slug = ?");
      values.push(slug);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await execute(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  },

  /**
   * 删除分类
   * @param {number} id - 分类 ID
   */
  async delete(id) {
    await execute("DELETE FROM categories WHERE id = ?", [id]);
  },
};

module.exports = CategoryModel;
