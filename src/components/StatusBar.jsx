export default function StatusBar({ content, fileName }) {
  const text = content || ''
  const words = text.trim() ? (text.match(/[\u4e00-\u9fa5]/g) || []).length + (text.match(/[a-zA-Z]+/g) || []).length : 0
  const chars = text.length
  const lines = text.split('\n').length

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span>{fileName}</span>
      </div>
      <div className="status-bar-right">
        <span>{lines} 行</span>
        <span>{words} 词</span>
        <span>{chars} 字符</span>
      </div>
    </div>
  )
}
