interface SpinnerProps {
  text?: string
}

export default function Spinner({ text = '加载中…' }: SpinnerProps) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      <p className="spinner-text">{text}</p>
    </div>
  )
}
