const { execute } = require("../config/database");

/**
 * 评论模型 - 评论 CRUD 及嵌套回复
 */
const CommentModel = {
  /**
   * 创建评论
   * @param {object} data - { post_id, user_id, parent_id, content }
   * @returns {object} 新评论信息
   */
  async create({ post_id, user_id, parent_id = null, content }) {
    const result = await execute(
      "INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
      [post_id, user_id, parent_id, content],
    );
    return this.findById(result.insertId);
  },

  /**
   * 根据 ID 查找评论
   * @param {number} id - 评论 ID
   * @returns {object|null} 评论信息
   */
  async findById(id) {
    const rows = await execute(
      `SELECT c.*, u.username AS author_name, u.avatar AS author_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [id],
    );

    if (!rows[0]) return null;

    const comment = rows[0];
    comment.author = {
      id: comment.user_id,
      username: comment.author_name,
      avatar: comment.author_avatar,
    };
    delete comment.author_name;
    delete comment.author_avatar;

    return comment;
  },

  /**
   * 根据文章 ID 查询评论列表（含嵌套回复）
   * @param {number} postId - 文章 ID
   * @returns {Array} 评论树形结构
   */
  async findByPostId(postId) {
    // 查询该文章的所有评论
    const comments = await execute(
      `SELECT c.*, u.username AS author_name, u.avatar AS author_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`,
      [postId],
    );

    // 格式化评论数据
    const formatted = comments.map((c) => ({
      ...c,
      author: {
        id: c.user_id,
        username: c.author_name,
        avatar: c.author_avatar,
      },
      replies: [],
    }));

    // 移除冗余字段
    formatted.forEach((c) => {
      delete c.author_name;
      delete c.author_avatar;
    });

    // 构建嵌套树形结构
    const commentMap = {};
    const rootComments = [];

    formatted.forEach((comment) => {
      commentMap[comment.id] = comment;
    });

    formatted.forEach((comment) => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  },

  /**
   * 统计文章评论数
   * @param {number} postId - 文章 ID
   * @returns {number} 评论数量
   */
  async countByPostId(postId) {
    const rows = await execute(
      "SELECT COUNT(*) AS count FROM comments WHERE post_id = ?",
      [postId],
    );
    return rows[0].count;
  },

  /**
   * 删除评论
   * @param {number} id - 评论 ID
   */
  async delete(id) {
    await execute("DELETE FROM comments WHERE id = ?", [id]);
  },

  /**
   * 检查评论是否属于指定用户
   * @param {number} id - 评论 ID
   * @param {number} userId - 用户 ID
   * @returns {boolean}
   */
  async isOwner(id, userId) {
    const rows = await execute(
      "SELECT id FROM comments WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    return rows.length > 0;
  },
};

module.exports = CommentModel;
