/** 聊天消息类型定义 */
export interface Message {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色：用户或助手 */
  role: "user" | "assistant";
  /** 消息文本内容 */
  content: string;
  /** 消息时间戳（毫秒） */
  timestamp: number;
  /** RAG 检索来源（仅增强模式） */
  sources?: Array<{ title: string; slug: string; score?: number }>;
  /** 意图分类结果（仅增强模式） */
  intent?: string;
}
