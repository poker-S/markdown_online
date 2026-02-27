const SECTIONS = [
  {
    title: '标题',
    items: [
      { syntax: '# 一级标题', desc: 'H1 大标题' },
      { syntax: '## 二级标题', desc: 'H2 章节标题' },
      { syntax: '### 三级标题', desc: 'H3 小节标题' },
    ]
  },
  {
    title: '文字格式',
    items: [
      { syntax: '**加粗**', desc: '粗体文字' },
      { syntax: '*斜体*', desc: '斜体文字' },
      { syntax: '~~删除线~~', desc: '删除线文字' },
      { syntax: '`行内代码`', desc: '行内代码片段' },
    ]
  },
  {
    title: '列表',
    items: [
      { syntax: '- 无序项目', desc: '无序列表（也可用 * 或 +）' },
      { syntax: '1. 有序项目', desc: '有序列表' },
      { syntax: '- [ ] 待办事项', desc: '任务列表（未完成）' },
      { syntax: '- [x] 已完成', desc: '任务列表（已完成）' },
    ]
  },
  {
    title: '链接与图片',
    items: [
      { syntax: '[文字](https://url)', desc: '超链接' },
      { syntax: '![描述](https://url/img.png)', desc: '图片' },
    ]
  },
  {
    title: '引用与分割线',
    items: [
      { syntax: '> 引用内容', desc: '块引用' },
      { syntax: '---', desc: '水平分割线' },
    ]
  },
  {
    title: '代码块',
    items: [
      { syntax: '```javascript\n代码内容\n```', desc: '代码块，支持语法高亮\n可指定语言：js / python / bash / css 等' },
    ]
  },
  {
    title: '表格',
    items: [
      { syntax: '| 列1 | 列2 |\n|-----|-----|\n| A   | B   |', desc: '基础表格\n对齐：:--- 左 / :---: 居中 / ---: 右' },
    ]
  },
  {
    title: '数学公式',
    items: [
      { syntax: '$E = mc^2$', desc: '行内公式（KaTeX）' },
      { syntax: '$$\n\\int_0^1 x\\,dx\n$$', desc: '块级公式，独占一行' },
    ]
  },
]

const FEATURES = [
  {
    title: '工具栏',
    desc: '编辑器上方工具栏提供常用格式按钮，点击即可在光标处插入对应语法。选中文字后点击加粗/斜体等按钮，会自动包裹选中内容。'
  },
  {
    title: '⊞ 表格构建器',
    desc: '点击工具栏「⊞ 表格」按钮，可视化设置行列数和对齐方式，自动生成表格 Markdown。'
  },
  {
    title: '∑ 数学公式库',
    desc: '点击工具栏「∑ 公式」按钮，从常用公式库中选择并插入，无需手写 LaTeX。'
  },
  {
    title: '粘贴图片',
    desc: '直接在编辑器中 Ctrl+V 粘贴截图或图片，自动上传并插入 Markdown 图片链接。点击 ⚙️ 可配置上传服务（Base64 / 自定义接口）。'
  },
  {
    title: 'Copy — 复制富文本',
    desc: '点击顶栏「Copy」按钮，将预览内容复制为带样式的富文本，可直接粘贴到微信公众号编辑器等富文本平台。'
  },
  {
    title: 'Export — 导出 HTML',
    desc: '点击顶栏「Export」按钮，将当前预览导出为独立 HTML 文件，包含代码高亮样式。'
  },
  {
    title: '分栏拖拽',
    desc: '在 Split 模式下，拖动编辑区与预览区之间的分割线，可自由调整两侧宽度比例。'
  },
  {
    title: '专注模式',
    desc: '点击顶栏「⊞」按钮进入专注模式，隐藏工具栏，预览区居中显示，减少干扰。'
  },
  {
    title: '快捷键',
    desc: 'Ctrl+S 保存文件\nCtrl+B 加粗\nCtrl+I 斜体'
  },
  {
    title: '自动保存',
    desc: '内容每隔 1 秒自动保存到浏览器本地存储，刷新页面后自动恢复上次内容。'
  },
  {
    title: 'Reset — 恢复初始状态',
    desc: '点击顶栏「Reset」按钮，清空浏览器本地存储的所有数据（包括编辑内容、文件名、主题、图片设置），恢复到初次打开时的默认状态。操作前会弹出确认框，确认后不可撤销。'
  },
]

export default function GuidePanel({ onClose }) {
  return (
    <>
      <div className="guide-overlay" onClick={onClose} />
      <div className="guide-panel">
        <div className="guide-header">
          <span className="guide-title">使用指南</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="guide-body">
          <section className="guide-section">
            <h3 className="guide-section-title">Markdown 语法</h3>
            {SECTIONS.map((sec, i) => (
              <div key={i} className="guide-group">
                <div className="guide-group-label">{sec.title}</div>
                {sec.items.map((item, j) => (
                  <div key={j} className="guide-item">
                    <pre className="guide-syntax">{item.syntax}</pre>
                    <span className="guide-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </section>

          <section className="guide-section">
            <h3 className="guide-section-title">编辑器功能</h3>
            {FEATURES.map((f, i) => (
              <div key={i} className="guide-feature">
                <div className="guide-feature-title">{f.title}</div>
                <div className="guide-feature-desc">{f.desc}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
