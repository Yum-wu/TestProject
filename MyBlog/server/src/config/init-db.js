const { execute } = require("./database");

// 建表 SQL 语句
const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_CATEGORIES_TABLE = `
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(60) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_TAGS_TABLE = `
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(60) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_POSTS_TABLE = `
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  content LONGTEXT NOT NULL,
  excerpt TEXT DEFAULT NULL,
  cover_image VARCHAR(255) DEFAULT NULL,
  category_id INT DEFAULT NULL,
  author_id INT NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  view_count INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_category (category_id),
  INDEX idx_author (author_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_POST_TAGS_TABLE = `
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX idx_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_COMMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_post (post_id),
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// 默认分类数据
const DEFAULT_CATEGORIES = [
  ["未分类", "uncategorized", "默认分类，未指定分类的文章"],
  ["技术", "technology", "技术相关文章"],
  ["生活", "life", "生活随笔与感悟"],
  ["随笔", "essay", "自由写作与思考"],
];

/**
 * 初始化数据库 - 创建所有表并插入默认数据
 */
async function initDatabase() {
  try {
    console.log("开始初始化数据库...");

    // 按依赖顺序创建表
    console.log("创建 users 表...");
    await execute(CREATE_USERS_TABLE);

    console.log("创建 categories 表...");
    await execute(CREATE_CATEGORIES_TABLE);

    console.log("创建 tags 表...");
    await execute(CREATE_TAGS_TABLE);

    console.log("创建 posts 表...");
    await execute(CREATE_POSTS_TABLE);

    console.log("创建 post_tags 表...");
    await execute(CREATE_POST_TAGS_TABLE);

    console.log("创建 comments 表...");
    await execute(CREATE_COMMENTS_TABLE);

    // 插入默认分类（忽略已存在的）
    console.log("插入默认分类...");
    for (const [name, slug, description] of DEFAULT_CATEGORIES) {
      await execute(
        "INSERT IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)",
        [name, slug, description],
      );
    }

    console.log("数据库初始化完成！");
  } catch (error) {
    console.error("数据库初始化失败：", error.message);
    throw error;
  }
}

module.exports = { initDatabase };
