/**
 * 文章服务 — 本地 Markdown 版本
 * 替代原来的 API 调用，改为从本地 Markdown 文件加载
 */
import { getAllPosts, getPostBySlug, searchPosts } from "../utils/posts-loader";
import type { Post } from "../types/blog";

export type { Post };

export { getAllPosts, getPostBySlug, searchPosts };

/** 获取所有文章（按日期倒序，用于首页列表） */
export function getPosts(): Post[] {
  return getAllPosts();
}
