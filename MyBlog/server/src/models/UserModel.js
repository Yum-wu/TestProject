const { execute } = require("../config/database");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

/**
 * 用户模型 - 用户 CRUD 操作
 */
const UserModel = {
  /**
   * 创建用户
   * @param {object} data - { username, email, password, avatar, bio }
   * @returns {object} 新用户信息（不含密码）
   */
  async create({ username, email, password, avatar = null, bio = null }) {
    // 密码加密
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await execute(
      "INSERT INTO users (username, email, password_hash, avatar, bio) VALUES (?, ?, ?, ?, ?)",
      [username, email, passwordHash, avatar, bio],
    );

    return this.findById(result.insertId);
  },

  /**
   * 根据 ID 查找用户
   * @param {number} id - 用户 ID
   * @returns {object|null} 用户信息（不含密码）
   */
  async findById(id) {
    const rows = await execute(
      "SELECT id, username, email, avatar, bio, created_at, updated_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },

  /**
   * 根据邮箱查找用户（含密码，用于登录验证）
   * @param {string} email - 邮箱
   * @returns {object|null} 用户信息（含密码哈希）
   */
  async findByEmail(email) {
    const rows = await execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  },

  /**
   * 根据用户名查找用户
   * @param {string} username - 用户名
   * @returns {object|null} 用户信息（不含密码）
   */
  async findByUsername(username) {
    const rows = await execute(
      "SELECT id, username, email, avatar, bio, created_at, updated_at FROM users WHERE username = ?",
      [username],
    );
    return rows[0] || null;
  },

  /**
   * 更新用户信息
   * @param {number} id - 用户 ID
   * @param {object} data - 更新字段 { username, email, avatar, bio }
   * @returns {object|null} 更新后的用户信息
   */
  async update(id, { username, email, avatar, bio }) {
    const fields = [];
    const values = [];

    if (username !== undefined) {
      fields.push("username = ?");
      values.push(username);
    }
    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }
    if (avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(avatar);
    }
    if (bio !== undefined) {
      fields.push("bio = ?");
      values.push(bio);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    return this.findById(id);
  },

  /**
   * 修改密码
   * @param {number} id - 用户 ID
   * @param {string} newPassword - 新密码
   */
  async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await execute("UPDATE users SET password_hash = ? WHERE id = ?", [
      passwordHash,
      id,
    ]);
  },

  /**
   * 验证密码
   * @param {string} plainPassword - 明文密码
   * @param {string} hash - 密码哈希
   * @returns {boolean} 是否匹配
   */
  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  /**
   * 删除用户
   * @param {number} id - 用户 ID
   */
  async delete(id) {
    await execute("DELETE FROM users WHERE id = ?", [id]);
  },
};

module.exports = UserModel;
