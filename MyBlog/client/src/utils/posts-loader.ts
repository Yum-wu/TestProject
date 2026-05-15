import type { Post, PostMeta } from "../types/blog";

/* ===== 通过 Vite 构建时导入所有 .md 文章 ===== */
const modules = import.meta.glob("../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * 解析 Markdown frontmatter
 * 格式:
 * ---
 * title: 标题
 * date: 2026-05-10
 * slug: my-post
 * tags: [tag1, tag2]
 * category: 分类
 * excerpt: 摘要
 * ---
 * 正文内容...
 */
function parseMarkdown(raw: string): Post {
  const meta: Partial<PostMeta> = {};
  let contentStart = 0;

  // 解析 frontmatter (--- 包裹的 YAML-like 部分)
  if (raw.startsWith("---\n")) {
    const endIndex = raw.indexOf("\n---\n", 4);
    if (endIndex !== -1) {
      const frontmatter = raw.slice(4, endIndex);
      contentStart = endIndex + 5;

      frontmatter.split("\n").forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) return;

        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        // 解析数组 [a, b, c]
        if (value.startsWith("[") && value.endsWith("]")) {
          value = value
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim().replace(/['"]/g, ""))
            .join(",");
        }

        switch (key) {
          case "title":
            meta.title = value.replace(/^["']|["']$/g, "");
            break;
          case "date":
            meta.date = value.replace(/^["']|["']$/g, "");
            break;
          case "slug":
            meta.slug = value.replace(/^["']|["']$/g, "");
            break;
          case "tags":
            meta.tags = value
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""))
              .filter(Boolean);
            break;
          case "category":
            meta.category = value.replace(/^["']|["']$/g, "");
            break;
          case "excerpt":
            meta.excerpt = value.replace(/^["']|["']$/g, "");
            break;
          case "cover":
            meta.cover = value.replace(/^["']|["']$/g, "");
            break;
          case "author":
            meta.author = value.replace(/^["']|["']$/g, "");
            break;
        }
      });
    }
  }

  const content = raw.slice(contentStart).trim();

  return {
    title: meta.title || "无标题",
    date: meta.date || "2026-01-01",
    slug: meta.slug || "",
    tags: meta.tags || [],
    category: meta.category || "未分类",
    excerpt: meta.excerpt || "",
    cover: meta.cover,
    author: meta.author || "Yum",
    content,
  };
}

/** 获取所有文章（按日期倒序） */
export function getAllPosts(): Post[] {
  return Object.values(modules)
    .map(parseMarkdown)
    .filter((p) => p.slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 根据 slug 获取文章 */
export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** 按分类筛选 */
export function getPostsByCategory(category: string): Post[] {
  if (!category) return getAllPosts();
  return getAllPosts().filter((p) => p.category === category);
}

/** 按标签筛选 */
export function getPostsByTag(tag: string): Post[] {
  if (!tag) return getAllPosts();
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

/** 获取所有分类 */
export function getAllCategories(): string[] {
  const cats = new Set<string>();
  getAllPosts().forEach((p) => cats.add(p.category));
  return Array.from(cats).sort();
}

/** 获取所有标签 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

/** 搜索文章（标题 + 摘要 + 正文） */
export function searchPosts(keyword: string): Post[] {
  if (!keyword) return getAllPosts();
  const kw = keyword.toLowerCase();
  return getAllPosts().filter(
    (p) =>
      p.title.toLowerCase().includes(kw) ||
      p.excerpt.toLowerCase().includes(kw) ||
      p.content.toLowerCase().includes(kw) ||
      p.tags.some((t) => t.toLowerCase().includes(kw)) ||
      p.category.toLowerCase().includes(kw)
  );
}

/** 估算阅读时间（分钟） */
export function estimateReadingTime(content: string): number {
  const zhChars = (content.match(/[一-鿿]/g) || []).length;
  const words = content.replace(/[一-鿿]/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil((zhChars + words) / 500));
}
