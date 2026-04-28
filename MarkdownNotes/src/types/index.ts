/**
 * 类型定义模块
 *
 * 定义应用中使用的数据结构和接口
 */

/**
 * 笔记数据结构
 *
 * @interface Note
 * @property {string} id - 笔记唯一标识符（使用 crypto.randomUUID() 生成）
 * @property {string} title - 笔记标题（自动从内容第一行提取）
 * @property {string} content - 笔记内容（Markdown 格式文本）
 * @property {number} createdAt - 笔记创建时间戳（毫秒）
 * @property {number} updatedAt - 笔记最后更新时间戳（毫秒）
 *
 * @example
 * const note: Note = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   title: "我的笔记",
 *   content: "# 标题\n\n这是笔记内容",
 *   createdAt: 1714291200000,
 *   updatedAt: 1714291200000,
 * };
 */
export interface Note {
  /** 笔记唯一标识符 */
  id: string;
  /** 笔记标题 */
  title: string;
  /** 笔记内容（Markdown 格式） */
  content: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}
