/**
 * 确认对话框组件
 * 用于删除/取消等危险操作的二次确认
 */
interface ConfirmDialogProps {
  /** 标题 */
  title: string;
  /** 提示消息 */
  message: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消/关闭回调 */
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">{title}</div>
        <div className="dialog-body">{message}</div>
        <div className="dialog-footer">
          <button className="btn btn-outline btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
