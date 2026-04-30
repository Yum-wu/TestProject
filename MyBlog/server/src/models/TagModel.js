const { execute } = require("../config/database");

/**
 * 标签模型 - 标签 CRUD 操作
 */
const TagModel = {
  /**
   * 创建标签
   * @param {object} data - { name, slug }
   * @returns {object} 新标签信息
   */
  async create({ name, slug }) {
    const result = await execute(
      "INSERT INTO tags (name, slug) VALUES (?, ?)",
      [name, slug],
    );
    return this.findById(result.insertId);
  },

  /**
   * 根据 ID 查找标签
   * @param {number} id - 标签 ID
   * @returns {object|null} 标签信息
   */
  async findById(id) {
    const rows = await execute("SELECT * FROM tags WHERE id = ?", [id]);
    return rows[0] || null;
  },

  /**
   * 根据 slug 查找标签
   * @param {string} slug - 标签 slug
   * @returns {object|null} 标签信息
   */
  async findBySlug(slug) {
    const rows = await execute("SELECT * FROM tags WHERE slug = ?", [slug]);
    return rows[0] || null;
  },

  /**
   * 获取所有标签（含文章数量）
   * @returns {Array} 标签列表
   */
  async findAll() {
    return execute(
      `SELECT t.*, COUNT(pt.post_id) AS post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published'
      GROUP BY t.id
      ORDER BY t.created_at DESC`,
    );
  },

  /**
   * 根据多个 ID 查找标签
   * @param {Array<number>} ids - 标签 ID 数组
   * @returns {Array} 标签列表
   */
  async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(", ");
    return execute(`SELECT * FROM tags WHERE id IN (${placeholders})`, ids);
  },

  /**
   * 删除标签
   * @param {number} id - 标签 ID
   */
  async delete(id) {
    await execute("DELETE FROM tags WHERE id = ?", [id]);
  },
};

module.exports = TagModel;
