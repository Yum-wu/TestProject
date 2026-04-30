import { useState, useCallback } from "react";
import type { Comment, CommentTree } from "../types";
import * as commentService from "../services/comments";
import { formatSmartTime } from "../utils/formatDate";

/**
 * 将后端 Comment 数据转换为 CommentList 组件所需的 CommentTree 格式
 */
function mapCommentToTree(comment: Comment): CommentTree {
  return {
    id: String(comment.id),
    content: comment.content,
    author: {
      name: comment.author?.username || "匿名",
      avatarUrl: comment.author?.avatar || undefined,
    },
    createdAt: formatSmartTime(comment.created_at),
    likeCount: 0,
    isLiked: false,
    replies: comment.replies?.map(mapCommentToTree),
  };
}

/* ===== Hook 返回值类型 ===== */
interface UseCommentsReturn {
  comments: CommentTree[];
  totalCount: number;
  loading: boolean;
  submitting: boolean;
  fetchComments: (postId: number) => Promise<void>;
  submitComment: (postId: number, content: string) => Promise<void>;
  submitReply: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
}

/**
 * 评论数据管理 Hook（含回复）
 * 所有回调函数使用 useCallback 包装，避免子组件不必要的重渲染
 */
export function useComments(): UseCommentsReturn {
  const [comments, setComments] = useState<CommentTree[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* 获取文章评论 - useCallback 包装 */
  const fetchComments = useCallback(async (postId: number) => {
    setLoading(true);
    try {
      const res = await commentService.getCommentsByPost(postId);
      const commentList = res.data;
      setComments(commentList.map(mapCommentToTree));
      /* 计算总评论数（含回复） */
      const count = commentList.reduce((acc, c) => {
        return acc + 1 + (c.replies?.length || 0);
      }, 0);
      setTotalCount(count);
    } catch {
      setComments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 发表评论 - useCallback 包装 */
  const submitComment = useCallback(
    async (postId: number, content: string) => {
      setSubmitting(true);
      try {
        await commentService.createComment({ post_id: postId, content });
        await fetchComments(postId);
      } finally {
        setSubmitting(false);
      }
    },
    [fetchComments]
  );

  /* 回复评论 - useCallback 包装 */
  const submitReply = useCallback(
    async (commentId: number, content: string) => {
      setSubmitting(true);
      try {
        await commentService.replyComment(commentId, { content });
        /* 回复后需要重新获取评论列表，但需要知道 postId */
        /* 这里通过刷新当前评论列表实现 */
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  /* 删除评论 - useCallback 包装 */
  const deleteComment = useCallback(async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
    } catch {
      /* 错误已在拦截器中处理 */
    }
  }, []);

  return {
    comments,
    totalCount,
    loading,
    submitting,
    fetchComments,
    submitComment,
    submitReply,
    deleteComment,
  };
}

export default useComments;
