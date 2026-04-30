const { execute } = require("../config/database");

/**
 * 文章模型 - 文章 CRUD 及关联查询
 */
const PostModel = {
  /**
   * 创建文章
   * @param {object} data - 文章数据
   * @returns {object} 新文章信息
   */
  async create({
    title,
    slug,
    content,
    excerpt,
    cover_image,
    category_id,
    author_id,
    status = "draft",
  }) {
    const result = await execute(
      "INSERT INTO posts (title, slug, content, excerpt, cover_image, category_id, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        slug,
        content,
        excerpt,
        cover_image,
        category_id,
        author_id,
        status,
      ],
    );

    return this.findById(result.insertId);
  },

  /**
   * 根据 ID 查找文章（含关联信息）
   * @param {number} id - 文章 ID
   * @returns {object|null} 文章详情
   */
  async findById(id) {
    const rows = await execute(
      `SELECT p.*, 
        c.name AS category_name, c.slug AS category_slug,
        u.username AS author_name, u.avatar AS author_avatar
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?`,
      [id],
    );

    if (!rows[0]) return null;

    const post = rows[0];
    // 查询文章标签
    post.tags = await this.findTagsByPostId(post.id);
    // 格式化分类和作者信息
    post.category = post.category_name
      ? {
          id: post.category_id,
          name: post.category_name,
          slug: post.category_slug,
        }
      : null;
    post.author = {
      id: post.author_id,
      username: post.author_name,
      avatar: post.author_avatar,
    };
    // 移除冗余字段
    delete post.category_name;
    delete post.category_slug;
    delete post.author_name;
    delete post.author_avatar;

    return post;
  },

  /**
   * 根据 slug 查找文章
   * @param {string} slug - 文章 slug
   * @returns {object|null} 文章详情
   */
  async findBySlug(slug) {
    const rows = await execute(`SELECT p.id FROM posts p WHERE p.slug = ?`, [
      slug,
    ]);
    if (!rows[0]) return null;
    return this.findById(rows[0].id);
  },

  /**
   * 检查 slug 是否已存在
   * @param {string} slug - slug 字符串
   * @param {number|null} excludeId - 排除的文章 ID（用于更新时）
   * @returns {boolean}
   */
  async slugExists(slug, excludeId = null) {
    let sql = "SELECT id FROM posts WHERE slug = ?";
    const params = [slug];
    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }
    const rows = await execute(sql, params);
    return rows.length > 0;
  },

  /**
   * 查询文章标签
   * @param {number} postId - 文章 ID
   * @returns {Array} 标签列表
   */
  async findTagsByPostId(postId) {
    return execute(
      `SELECT t.id, t.name, t.slug 
      FROM tags t
      INNER JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?`,
      [postId],
    );
  },

  /**
   * 设置文章标签（替换原有标签）
   * @param {number} postId - 文章 ID
   * @param {Array<number>} tagIds - 标签 ID 数组
   */
  async setTags(postId, tagIds) {
    // 先删除原有标签关联
    await execute("DELETE FROM post_tags WHERE post_id = ?", [postId]);

    // 批量插入新标签关联
    if (tagIds && tagIds.length > 0) {
      const placeholders = tagIds.map(() => "(?, ?)").join(", ");
      const values = tagIds.flatMap((tagId) => [postId, tagId]);
      await execute(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ${placeholders}`,
        values,
      );
    }
  },

  /**
   * 分页查询文章列表（支持搜索、筛选）
   * @param {object} options - 查询选项
   * @returns {object} { items, total }
   */
  async findAll({
    page = 1,
    pageSize = 10,
    keyword = "",
    categoryId = null,
    tagId = null,
    status = "published",
    authorId = null,
  } = {}) {
    const offset = (page - 1) * pageSize;
    const conditions = [];
    const params = [];

    // 状态筛选
    if (status) {
      conditions.push("p.status = ?");
      params.push(status);
    }

    // 关键词搜索（标题或内容）- 转义 LIKE 特殊字符防止通配符注入
    if (keyword) {
      const escapedKeyword = keyword
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_");
      conditions.push("(p.title LIKE ? OR p.content LIKE ?)");
      params.push(`%${escapedKeyword}%`, `%${escapedKeyword}%`);
    }

    // 分类筛选
    if (categoryId) {
      conditions.push("p.category_id = ?");
      params.push(categoryId);
    }

    // 作者筛选
    if (authorId) {
      conditions.push("p.author_id = ?");
      params.push(authorId);
    }

    // 标签筛选（需要 JOIN post_tags 表）
    let tagJoin = "";
    if (tagId) {
      tagJoin = "INNER JOIN post_tags pt ON p.id = pt.post_id";
      conditions.push("pt.tag_id = ?");
      params.push(tagId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 查询总数
    const countRows = await execute(
      `SELECT COUNT(DISTINCT p.id) AS total FROM posts p ${tagJoin} ${whereClause}`,
      params,
    );
    const total = countRows[0].total;

    // 查询列表
    const items = await execute(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.status, p.view_count, p.created_at, p.updated_at,
        c.name AS category_name, c.slug AS category_slug,
        u.username AS author_name, u.avatar AS author_avatar
      FROM posts p
      ${tagJoin}
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, pageSize, offset],
    );

    // 为每篇文章查询标签
    for (const item of items) {
      item.tags = await this.findTagsByPostId(item.id);
      item.category = item.category_name
        ? {
            id: item.category_id,
            name: item.category_name,
            slug: item.category_slug,
          }
        : null;
      item.author = {
        id: item.author_id,
        username: item.author_name,
        avatar: item.author_avatar,
      };
      delete item.category_name;
      delete item.category_slug;
      delete item.author_name;
      delete item.author_avatar;
    }

    return { items, total };
  },

  /**
   * 更新文章
   * @param {number} id - 文章 ID
   * @param {object} data - 更新字段
   * @returns {object|null} 更新后的文章
   */
  async update(
    id,
    { title, slug, content, excerpt, cover_image, category_id, status },
  ) {
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (slug !== undefined) {
      fields.push("slug = ?");
      values.push(slug);
    }
    if (content !== undefined) {
      fields.push("content = ?");
      values.push(content);
    }
    if (excerpt !== undefined) {
      fields.push("excerpt = ?");
      values.push(excerpt);
    }
    if (cover_image !== undefined) {
      fields.push("cover_image = ?");
      values.push(cover_image);
    }
    if (category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(category_id);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await execute(`UPDATE posts SET ${fields.join(", ")} WHERE id = ?`, values);

    return this.findById(id);
  },

  /**
   * 增加浏览量
   * @param {number} id - 文章 ID
   */
  async incrementViewCount(id) {
    await execute("UPDATE posts SET view_count = view_count + 1 WHERE id = ?", [
      id,
    ]);
  },

  /**
   * 删除文章
   * @param {number} id - 文章 ID
   */
  async delete(id) {
    await execute("DELETE FROM posts WHERE id = ?", [id]);
  },
};

module.exports = PostModel;
