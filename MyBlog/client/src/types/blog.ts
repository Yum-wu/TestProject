/* ===== 纯静态博客类型定义 ===== */

/** 文章 frontmatter 元数据 */
export interface PostMeta {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  category: string;
  excerpt: string;
  cover?: string;
  /** 作者显示名，默认 "Yum" */
  author?: string;
}

/** 完整文章（含正文内容） */
export interface Post extends PostMeta {
  content: string;
}

/** 文章列表项（用于 PostCard 适配） */
export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  viewCount: number;
  readingTime: number;
}
