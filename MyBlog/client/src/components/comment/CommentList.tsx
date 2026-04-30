import { useState } from "react";
import CommentItem from "./CommentItem";
import type { Comment } from "./CommentItem";
import CommentForm from "./CommentForm";
import EmptyState from "../common/EmptyState";
import { Spinner } from "../common/Loading";
import Button from "../common/Button";

/* ===== CommentList 组件属性 ===== */
interface CommentListProps {
  /** 评论列表 */
  comments: Comment[];
  /** 是否加载中 */
  loading?: boolean;
  /** 总评论数 */
  totalCount?: number;
  /** 提交评论回调 */
  onSubmitComment: (content: string) => void;
  /** 提交回复回调 */
  onSubmitReply: (commentId: string, content: string) => void;
  /** 点赞回调 */
  onLike?: (commentId: string) => void;
  /** 删除评论回调 */
  onDelete?: (commentId: string) => void;
  /** 是否已登录 */
  isLoggedIn?: boolean;
  /** 当前用户名 */
  username?: string;
  /** 当前用户头像 */
  avatarUrl?: string;
  /** 是否有更多评论 */
  hasMore?: boolean;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 加载更多是否进行中 */
  loadingMore?: boolean;
}

/**
 * 评论列表组件
 * 包含评论表单、评论列表、加载更多
 */
export default function CommentList({
  comments,
  loading = false,
  totalCount,
  onSubmitComment,
  onSubmitReply,
  onLike,
  onDelete,
  isLoggedIn = false,
  username,
  avatarUrl,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}: CommentListProps) {
  const [replyTarget, setReplyTarget] = useState<{
    id: string;
    username: string;
  } | null>(null);

  /* 取消回复 */
  const handleCancelReply = () => {
    setReplyTarget(null);
  };

  /* 提交回复 */
  const handleSubmitReply = (commentId: string, content: string) => {
    onSubmitReply(commentId, content);
    setReplyTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* ===== 评论区域标题 ===== */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          评论
          {totalCount !== undefined && (
            <span className="ml-2 text-sm font-normal text-neutral-400 dark:text-neutral-500">
              ({totalCount})
            </span>
          )}
        </h3>
      </div>

      {/* ===== 发表评论表单 ===== */}
      {isLoggedIn ? (
        <CommentForm
          onSubmit={onSubmitComment}
          avatarUrl={avatarUrl}
          username={username}
          placeholder="分享你的想法..."
        />
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            请先登录后再发表评论
          </p>
        </div>
      )}

      {/* ===== 回复提示条 ===== */}
      {replyTarget && (
        <div className="flex items-center justify-between rounded-lg bg-primary-50 dark:bg-primary-950/20 px-4 py-2.5 animate-slideDown">
          <span className="text-sm text-primary-700 dark:text-primary-300">
            回复 <span className="font-medium">@{replyTarget.username}</span>
          </span>
          <button
            type="button"
            onClick={handleCancelReply}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
          >
            取消
          </button>
        </div>
      )}

      {/* ===== 评论列表 ===== */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          title="暂无评论"
          description="成为第一个评论的人吧！"
          className="py-10"
        />
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={onLike ? () => onLike(comment.id) : undefined}
              onDelete={onDelete ? () => onDelete(comment.id) : undefined}
              onReply={() =>
                setReplyTarget({
                  id: comment.id,
                  username: comment.author.name,
                })
              }
              replyTarget={replyTarget}
              onSubmitReply={handleSubmitReply}
              onCancelReply={handleCancelReply}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}

      {/* ===== 加载更多 ===== */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoadMore}
            loading={loadingMore}
          >
            加载更多评论
          </Button>
        </div>
      )}
    </div>
  );
}
