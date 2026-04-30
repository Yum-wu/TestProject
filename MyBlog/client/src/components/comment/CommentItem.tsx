import { memo } from "react";
import ReplyForm from "./ReplyForm";

/* ===== 评论数据接口 ===== */
export type Comment = {
  id: string;
  content: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  likeCount: number;
  isLiked?: boolean;
  replies?: Comment[];
};

/* ===== CommentItem 组件属性 ===== */
interface CommentItemProps {
  /** 评论数据 */
  comment: Comment;
  /** 点赞回调 */
  onLike?: () => void;
  /** 删除回调 */
  onDelete?: () => void;
  /** 回复回调 */
  onReply?: () => void;
  /** 回复目标 */
  replyTarget?: { id: string; username: string } | null;
  /** 提交回复回调 */
  onSubmitReply: (commentId: string, content: string) => void;
  /** 取消回复回调 */
  onCancelReply: () => void;
  /** 是否已登录 */
  isLoggedIn?: boolean;
  /** 缩进层级 */
  depth?: number;
}

/**
 * 评论项组件
 * 包含头像、用户名、内容、时间、回复按钮
 * 使用 React.memo 优化，避免评论列表中单项更新导致全部重渲染
 */
function CommentItem({
  comment,
  onLike,
  onDelete,
  onReply,
  replyTarget,
  onSubmitReply,
  onCancelReply,
  isLoggedIn = false,
  depth = 0,
}: CommentItemProps) {
  const isReplying = replyTarget?.id === comment.id;

  return (
    <div className={`${depth > 0 ? "ml-8 sm:ml-12" : ""}`}>
      <div className="py-5">
        {/* ===== 评论头部 ===== */}
        <div className="flex items-start gap-3">
          {/* 头像 */}
          {comment.author.avatarUrl ? (
            <img
              src={comment.author.avatarUrl}
              alt={comment.author.name}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-medium text-white">
              {comment.author.name.charAt(0).toUpperCase()}
            </span>
          )}

          {/* 评论内容区 */}
          <div className="flex-1 min-w-0">
            {/* 用户名和时间 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {comment.author.name}
              </span>
              <time className="text-xs text-neutral-400 dark:text-neutral-500">
                {comment.createdAt}
              </time>
            </div>

            {/* 评论正文 */}
            <div className="mt-1.5 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </div>

            {/* ===== 操作按钮 ===== */}
            <div className="mt-2.5 flex items-center gap-4">
              {/* 点赞 */}
              <button
                type="button"
                onClick={onLike}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.isLiked
                    ? "text-red-500 dark:text-red-400"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill={comment.isLiked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                {comment.likeCount > 0 && comment.likeCount}
              </button>

              {/* 回复 */}
              {isLoggedIn && depth < 3 && (
                <button
                  type="button"
                  onClick={onReply}
                  className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  回复
                </button>
              )}

              {/* 删除（仅自己的评论） */}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  删除
                </button>
              )}
            </div>

            {/* ===== 回复表单 ===== */}
            {isReplying && (
              <div className="mt-3 animate-slideDown">
                <ReplyForm
                  onSubmit={(content) => onSubmitReply(comment.id, content)}
                  onCancel={onCancelReply}
                  placeholder={`回复 @${comment.author.name}...`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 嵌套回复 ===== */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l-2 border-neutral-100 dark:border-neutral-800 ml-4 sm:ml-6">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              replyTarget={replyTarget}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              isLoggedIn={isLoggedIn}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* 使用 React.memo 包装，对评论项进行浅比较，避免列表全量重渲染 */
export default memo(CommentItem);
