/**
 * 空状态组件
 * 无数据时展示的占位提示
 */
interface EmptyProps {
  /** 提示文字，默认"暂无数据" */
  text?: string;
}

export default function Empty({ text = '暂无数据' }: EmptyProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">&#x1F4E6;</div>
      <div className="empty-state-text">{text}</div>
    </div>
  );
}
