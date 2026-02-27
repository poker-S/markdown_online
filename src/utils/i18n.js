export const translations = {
  zh: {
    app: {
      reset: 'Reset', resetTitle: '清空本地数据，恢复初始状态',
      guide: 'Guide', guideTitle: '使用指南',
      open: '打开', openTitle: '打开文件',
      save: '保存', saveTitle: '保存 (Ctrl+S)',
      export: '导出', exportTitle: '导出 HTML',
      copy: '复制', copyTitle: '复制内容',
      copyWechat: '微信公众号',
      copy52pojie: '52pojie BBCode',
      copy52pojieSuccess: '已复制 BBCode，在52pojie编辑器切换到「源码」模式后粘贴',
      edit: '编辑', split: '分栏', preview: '预览',
      settingsTitle: '图片上传设置',
      focusEnter: '进入专注模式', focusExit: '退出专注模式',
      rename: { title: '重命名文件', label: '文件名', cancel: '取消', confirm: '确认' },
      copySuccess: '已复制富文本，可粘贴到微信公众号编辑器',
      resetConfirm: '确定要清空所有本地数据并恢复初始状态吗？',
    },
    toolbar: {
      h1: 'H1', h1Title: '一级标题',
      h2: 'H2', h2Title: '二级标题',
      h3: 'H3', h3Title: '三级标题',
      bold: 'B', boldTitle: '加粗 (Ctrl+B)',
      italic: 'I', italicTitle: '斜体 (Ctrl+I)',
      strike: 'S', strikeTitle: '删除线',
      code: '`', codeTitle: '行内代码',
      quote: '❝', quoteTitle: '引用',
      codeBlock: '```', codeBlockTitle: '代码块',
      hr: '—', hrTitle: '分割线',
      ul: '• 列表', ulTitle: '无序列表',
      ol: '1. 列表', olTitle: '有序列表',
      task: '☑ 任务', taskTitle: '任务列表',
      link: '🔗 链接', linkTitle: '插入链接',
      image: '🖼 图片', imageTitle: '插入图片 URL',
      table: '⊞ 表格', tableTitle: '插入表格',
      math: '∑ 公式', mathTitle: '数学公式库',
      visual: '✦ 可视化插入', visualTitle: '可视化插入（Word 风格编辑）',
    },
    status: { lines: '行', words: '词', chars: '字符', saved: '已自动保存' },
    settings: {
      title: '图片存储设置',
      storageLabel: '存储方式',
      base64Option: '方案一：内嵌 Base64（推荐）',
      localOption: '方案二：本地文件引用',
      base64Desc: '图片数据直接嵌入 .md 文件，无需网络，文件可在任何地方打开并正常显示图片。',
      base64Warn: '⚠️ 图片越多文件体积越大，不适合图片密集型文档。',
      localDesc: '图片以相对路径引用（./images/xxx.png），文件体积小，与 VSCode 方式一致。',
      localWarn: '⚠️ 图片文件必须与 .md 文件放在同一目录，单独移动 .md 文件会导致图片无法显示。在线版不支持此方案。',
      langLabel: '界面语言', langZh: '中文', langEn: 'English',
      cancel: '取消', save: '保存',
    },
    hint: {
      title: '图片存储方式说明',
      intro: '粘贴图片时，编辑器提供两种存储方式，可在右上角 ⚙️ 设置 中随时切换。',
      base64Title: '✅ 方案一：内嵌 Base64（默认推荐）',
      base64Desc: '图片数据直接嵌入 .md 文件，无需任何网络服务，文件可在任何地方打开并正常显示图片。',
      base64Warn: '⚠️ 注意：图片会被转为很长的字符串存入文件，图片越多文件体积越大，不适合图片密集型文档。',
      localTitle: '📁 方案二：本地文件引用',
      localDesc: '图片以相对路径引用（如 ./images/xxx.png），.md 文件体积小，与 VSCode 方式一致。',
      localWarn: '⚠️ 注意：图片文件必须和 .md 文件放在一起，单独移动 .md 文件会导致图片无法显示。此方案在在线版中无法使用。',
      dismiss: '知道了，不再提示', close: '关闭',
    },
    math: {
      title: '数学公式库',
      insertMode: '插入方式：',
      inline: '行内（嵌入文字中）', block: '独立成行（居中展示）',
      greek: '希腊字母', operators: '运算符', expressions: '常用表达式', templates: '公式模板',
      templateLabels: ['一元二次方程', '欧拉公式', '勾股定理', '正态分布', '泰勒展开', '傅里叶变换'],
    },
    table: {
      selectTitle: '选择表格大小', editTitle: (r, c) => `编辑表格（${r} 行 × ${c} 列）`,
      rowLabel: '行', colLabel: '列',
      headerHint: '第一行为表头，其余为内容',
      cancel: '取消', next: '下一步', insert: '插入表格',
    },
    visual: {
      introSub: '可视化 Markdown 编辑器 · 所见即所得',
      start: '开始使用 →',
      headerTitle: 'PokerS文档 · 可视化插入',
      placeholder: '在此输入内容，选中文字后点击上方按钮应用格式...',
      hint: '选中文字 → 点击格式按钮 · 完成后点击右侧按钮插入到编辑器光标处',
      confirm: '确认插入 ✓',
      clear: '清空', clearConfirm: '确定要清空内容吗？',
      linkPrompt: '输入链接地址：', imageUrlPrompt: '输入图片地址：',
      tb: {
        h1: 'H1', h1t: '一级标题', h2: 'H2', h2t: '二级标题', h3: 'H3', h3t: '三级标题',
        bold: 'B', boldt: '加粗', italic: 'I', italict: '斜体',
        strike: 'S', striket: '删除线', code: '`', codet: '行内代码',
        codeLang: '语言（如 javascript）', codePlaceholder: '在此输入代码...',
        quote: '❝', quotet: '引用', ul: '• 列表', ult: '无序列表',
        ol: '1. 列表', olt: '有序列表', link: '🔗 链接', linkt: '插入链接',
        table: '🔲 表格', tablet: '插入表格',
        imageUrl: '🖼 图片URL', imageUrlt: '通过URL插入图片',
        imageUpload: '📁 上传图片', imageUploadt: '从本地上传图片',
      },
    },
    guide: {
      title: '使用指南',
      syntaxTitle: 'Markdown 语法',
      featuresTitle: '编辑器功能',
      aboutTitle: '关于',
      changelogTitle: '更新日志',
      changelog: [
        { ver: 'v1.2.0', date: '2026-02-28', items: [
          'Copy ▾ 下拉菜单：微信公众号富文本 / 52pojie BBCode 两种复制方式',
          '52pojie BBCode 转换器：支持表格、代码高亮（[mw_shl_code]）',
          '数学公式库：模板标签中文化（一元二次方程、欧拉公式等）',
          '可视化插入：代码块新增弹出输入框，支持语言选择',
          '修复：可视化插入引用块 / 行内代码无法 toggle 取消',
          'Guide 面板：新增关于区块（GitHub + 微信公众号）、内容更新',
        ]},
        { ver: 'v1.1.0', date: '2026-02-27', items: [
          '中英文双语界面，可在 ⚙️ 设置中切换',
          '可视化插入：格式按钮激活状态、清空按钮、草稿本地存储',
        ]},
      ],
      sections: [
        { title: '标题', items: [
          { syntax: '# 一级标题', desc: 'H1 大标题' },
          { syntax: '## 二级标题', desc: 'H2 章节标题' },
          { syntax: '### 三级标题', desc: 'H3 小节标题' },
        ]},
        { title: '文字格式', items: [
          { syntax: '**加粗**', desc: '粗体文字' },
          { syntax: '*斜体*', desc: '斜体文字' },
          { syntax: '~~删除线~~', desc: '删除线文字' },
          { syntax: '`行内代码`', desc: '行内代码片段' },
        ]},
        { title: '列表', items: [
          { syntax: '- 无序项目', desc: '无序列表（也可用 * 或 +）' },
          { syntax: '1. 有序项目', desc: '有序列表' },
          { syntax: '- [ ] 待办事项', desc: '任务列表（未完成）' },
          { syntax: '- [x] 已完成', desc: '任务列表（已完成）' },
        ]},
        { title: '链接与图片', items: [
          { syntax: '[文字](https://url)', desc: '超链接' },
          { syntax: '![描述](https://url/img.png)', desc: '图片' },
        ]},
        { title: '引用与分割线', items: [
          { syntax: '> 引用内容', desc: '块引用' },
          { syntax: '---', desc: '水平分割线' },
        ]},
        { title: '代码块', items: [
          { syntax: '```javascript\n代码内容\n```', desc: '代码块，支持语法高亮\n可指定语言：js / python / bash / css 等' },
        ]},
        { title: '表格', items: [
          { syntax: '| 列1 | 列2 |\n|-----|-----|\n| A   | B   |', desc: '基础表格\n对齐：:--- 左 / :---: 居中 / ---: 右' },
        ]},
        { title: '数学公式', items: [
          { syntax: '$E = mc^2$', desc: '行内公式（KaTeX）' },
          { syntax: '$$\n\\int_0^1 x\\,dx\n$$', desc: '块级公式，独占一行' },
        ]},
      ],
      features: [
        { title: '工具栏', desc: '编辑器上方工具栏提供常用格式按钮，点击即可在光标处插入对应语法。选中文字后点击加粗/斜体等按钮，会自动包裹选中内容。' },
        { title: '⊞ 表格构建器', desc: '点击工具栏「⊞ 表格」按钮，可视化设置行列数和对齐方式，自动生成表格 Markdown。' },
        { title: '∑ 数学公式库', desc: '点击工具栏「∑ 公式」按钮，从常用公式库中选择并插入，无需手写 LaTeX。' },
        { title: '✦ 可视化插入', desc: '点击工具栏「✦ 可视化插入」按钮，进入 Word 风格所见即所得编辑器。选中文字后点击格式按钮应用样式，支持表格、图片插入，完成后自动转为 Markdown 插入到光标处。' },
        { title: '粘贴图片', desc: '直接在编辑器中 Ctrl+V 粘贴截图或图片，自动上传并插入 Markdown 图片链接。点击 ⚙️ 可配置存储方式（Base64 内嵌 / 本地文件引用）。' },
        { title: 'Copy ▾ — 复制内容', desc: '点击顶栏「Copy ▾」展开下拉菜单，选择复制方式：\n• 微信公众号：复制带样式的富文本，可直接粘贴到微信公众号编辑器。\n• 52pojie BBCode：复制 BBCode 格式文本，粘贴到吾爱破解论坛编辑器「源码」模式即可发帖，支持代码高亮和表格。' },
        { title: 'Export — 导出 HTML', desc: '点击顶栏「Export」按钮，将当前预览导出为独立 HTML 文件，包含代码高亮样式，可直接在浏览器中打开。' },
        { title: '文件操作', desc: '• Open：打开本地 .md / .txt 文件载入编辑器。\n• Save（Ctrl+S）：将当前内容下载为 .md 文件。\n• 文件名旁的 ✎ 按钮：重命名文件。' },
        { title: '⚙️ 设置', desc: '配置图片存储方式（Base64 内嵌或本地文件引用）和界面语言（中文 / English）。' },
        { title: '主题切换', desc: '点击顶栏 🌙 / ☀️ 按钮，在深色和浅色主题之间切换，偏好自动保存。' },
        { title: '分栏拖拽', desc: '在 Split 模式下，拖动编辑区与预览区之间的分割线，可自由调整两侧宽度比例。' },
        { title: '专注模式', desc: '点击顶栏「⊞」按钮进入专注模式，隐藏工具栏，预览区居中显示，减少干扰。' },
        { title: '快捷键', desc: 'Ctrl+S 保存文件\nCtrl+B 加粗\nCtrl+I 斜体' },
        { title: '自动保存', desc: '内容每隔 1 秒自动保存到浏览器本地存储，刷新页面后自动恢复上次内容。' },
        { title: 'Reset — 恢复初始状态', desc: '点击顶栏「Reset」按钮，清空浏览器本地存储的所有数据（包括编辑内容、文件名、主题、图片设置），恢复到初次打开时的默认状态。操作前会弹出确认框，确认后不可撤销。' },
      ],
    },
    defaultContent: `# 欢迎使用 Markdown Editor

**Mac 风格** Markdown 编辑器，支持实时预览、可视化插入、数学公式、代码高亮等功能。内容实时保存至本地浏览器，关闭页面后数据不会丢失，点击顶栏 **Guide** 查看完整使用文档。

---

## 快速上手

| 按钮 | 功能 |
|------|------|
| Edit / Split / Preview | 切换视图，Split 模式下分割线可拖拽 |
| ✦ 可视化插入 | Word 风格编辑，自动转 Markdown |
| ⊞ 表格 | 可视化表格构建器 |
| ∑ 公式 | 数学公式库 |
| Export | 导出 HTML 文件 |
| Copy ▾ | 下拉选择：微信公众号富文本 / 52pojie BBCode |
| Reset | 清空本地数据，恢复初始状态 |

## 快捷键

| 功能 | 快捷键 |
|------|--------|
| 保存文件 | Ctrl+S |
| 加粗 | Ctrl+B |
| 斜体 | Ctrl+I |

## 数学公式示例

行内：$E = mc^2$　　块级：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 代码高亮示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
}
\`\`\`

> 开始编辑吧，左侧写 Markdown，右侧实时预览。
`,
  }, // end zh
  en: {
    app: {
      reset: 'Reset', resetTitle: 'Clear local data and restore defaults',
      guide: 'Guide', guideTitle: 'User Guide',
      open: 'Open', openTitle: 'Open file',
      save: 'Save', saveTitle: 'Save (Ctrl+S)',
      export: 'Export', exportTitle: 'Export HTML',
      copy: 'Copy', copyTitle: 'Copy',
      copyWechat: 'WeChat',
      copy52pojie: '52pojie BBCode',
      copy52pojieSuccess: 'BBCode copied. Paste in 52pojie editor source mode.',
      edit: 'Edit', split: 'Split', preview: 'Preview',
      settingsTitle: 'Image Upload Settings',
      focusEnter: 'Enter focus mode', focusExit: 'Exit focus mode',
      rename: { title: 'Rename File', label: 'File Name', cancel: 'Cancel', confirm: 'Confirm' },
      copySuccess: 'Rich text copied. You can paste it into your editor.',
      resetConfirm: 'Clear all local data and restore to initial state?',
    },
    toolbar: {
      h1: 'H1', h1Title: 'Heading 1',
      h2: 'H2', h2Title: 'Heading 2',
      h3: 'H3', h3Title: 'Heading 3',
      bold: 'B', boldTitle: 'Bold (Ctrl+B)',
      italic: 'I', italicTitle: 'Italic (Ctrl+I)',
      strike: 'S', strikeTitle: 'Strikethrough',
      code: '`', codeTitle: 'Inline code',
      quote: '❝', quoteTitle: 'Blockquote',
      codeBlock: '```', codeBlockTitle: 'Code block',
      hr: '—', hrTitle: 'Horizontal rule',
      ul: '• List', ulTitle: 'Unordered list',
      ol: '1. List', olTitle: 'Ordered list',
      task: '☑ Task', taskTitle: 'Task list',
      link: '🔗 Link', linkTitle: 'Insert link',
      image: '🖼 Image', imageTitle: 'Insert image URL',
      table: '⊞ Table', tableTitle: 'Insert table',
      math: '∑ Formula', mathTitle: 'Math formula library',
      visual: '✦ Visual Insert', visualTitle: 'Visual Insert (Word-style editor)',
    },
    status: { lines: 'lines', words: 'words', chars: 'chars', saved: 'Auto-saved' },
    settings: {
      title: 'Image Storage Settings',
      storageLabel: 'Storage Method',
      base64Option: 'Option 1: Inline Base64 (Recommended)',
      localOption: 'Option 2: Local File Reference',
      base64Desc: 'Image data is embedded directly in the .md file. No network required, works anywhere.',
      base64Warn: '⚠️ More images means larger file size. Not ideal for image-heavy documents.',
      localDesc: 'Images referenced by relative path (./images/xxx.png). Small file size, same as VSCode.',
      localWarn: '⚠️ Image files must be in the same directory as the .md file. Not supported in the online version.',
      langLabel: 'Interface Language', langZh: '中文', langEn: 'English',
      cancel: 'Cancel', save: 'Save',
    },
    hint: {
      title: 'Image Storage Options',
      intro: 'When pasting images, two storage methods are available. Switch anytime in ⚙️ Settings.',
      base64Title: '✅ Option 1: Inline Base64 (Default)',
      base64Desc: 'Image data is embedded directly in the .md file. No network required, works anywhere.',
      base64Warn: '⚠️ More images means larger file size. Not ideal for image-heavy documents.',
      localTitle: '📁 Option 2: Local File Reference',
      localDesc: 'Images referenced by relative path (e.g. ./images/xxx.png). Small file size, same as VSCode.',
      localWarn: '⚠️ Image files must stay in the same directory as the .md file. Not supported in the online version.',
      dismiss: "Got it, don't show again", close: 'Close',
    },
    math: {
      title: 'Math Formula Library',
      insertMode: 'Insert as:',
      inline: 'Inline (within text)', block: 'Block (centered)',
      greek: 'Greek Letters', operators: 'Operators', expressions: 'Expressions', templates: 'Templates',
      templateLabels: ['Quadratic', "Euler's", 'Pythagorean', 'Normal dist', 'Taylor', 'Fourier'],
    },
    table: {
      selectTitle: 'Select Table Size', editTitle: (r, c) => `Edit Table (${r} rows × ${c} cols)`,
      rowLabel: 'Rows', colLabel: 'Cols',
      headerHint: 'First row is the header',
      cancel: 'Cancel', next: 'Next', insert: 'Insert Table',
    },
    visual: {
      introSub: 'Visual Markdown Editor · What You See Is What You Get',
      start: 'Get Started →',
      headerTitle: 'PokerS Docs · Visual Insert',
      placeholder: 'Type here. Select text then click a format button to apply styles...',
      hint: 'Select text → click format button · then click the button on the right to insert at cursor',
      confirm: 'Insert ✓',
      clear: 'Clear', clearConfirm: 'Clear all content?',
      linkPrompt: 'Enter link URL:', imageUrlPrompt: 'Enter image URL:',
      tb: {
        h1: 'H1', h1t: 'Heading 1', h2: 'H2', h2t: 'Heading 2', h3: 'H3', h3t: 'Heading 3',
        bold: 'B', boldt: 'Bold', italic: 'I', italict: 'Italic',
        strike: 'S', striket: 'Strikethrough', code: '`', codet: 'Inline code',
        codeLang: 'Language (e.g. javascript)', codePlaceholder: 'Enter code here...',
        quote: '❝', quotet: 'Blockquote', ul: '• List', ult: 'Unordered list',
        ol: '1. List', olt: 'Ordered list', link: '🔗 Link', linkt: 'Insert link',
        table: '🔲 Table', tablet: 'Insert table',
        imageUrl: '🖼 Image URL', imageUrlt: 'Insert image by URL',
        imageUpload: '📁 Upload', imageUploadt: 'Upload local image',
      },
    },
    guide: {
      title: 'User Guide',
      syntaxTitle: 'Markdown Syntax',
      featuresTitle: 'Editor Features',
      aboutTitle: 'About',
      changelogTitle: 'Changelog',
      changelog: [
        { ver: 'v1.2.0', date: '2026-02-28', items: [
          'Copy ▾ dropdown: WeChat rich text / 52pojie BBCode options',
          '52pojie BBCode converter: tables, code highlight ([mw_shl_code])',
          'Math panel: template labels localized in Chinese mode',
          'Visual Insert: code block popup with language selector',
          'Fix: blockquote / inline code toggle off in Visual Insert',
          'Guide panel: About section (GitHub + WeChat), content updated',
        ]},
        { ver: 'v1.1.0', date: '2026-02-27', items: [
          'i18n: Chinese/English UI, switchable in ⚙️ Settings',
          'Visual Insert: active format indicators, clear button, draft persistence',
        ]},
      ],
      sections: [
        { title: 'Headings', items: [
          { syntax: '# Heading 1', desc: 'H1 large heading' },
          { syntax: '## Heading 2', desc: 'H2 section heading' },
          { syntax: '### Heading 3', desc: 'H3 sub-section heading' },
        ]},
        { title: 'Text Formatting', items: [
          { syntax: '**bold**', desc: 'Bold text' },
          { syntax: '*italic*', desc: 'Italic text' },
          { syntax: '~~strikethrough~~', desc: 'Strikethrough text' },
          { syntax: '`inline code`', desc: 'Inline code snippet' },
        ]},
        { title: 'Lists', items: [
          { syntax: '- Unordered item', desc: 'Unordered list (also * or +)' },
          { syntax: '1. Ordered item', desc: 'Ordered list' },
          { syntax: '- [ ] Todo item', desc: 'Task list (unchecked)' },
          { syntax: '- [x] Done item', desc: 'Task list (checked)' },
        ]},
        { title: 'Links & Images', items: [
          { syntax: '[text](https://url)', desc: 'Hyperlink' },
          { syntax: '![alt](https://url/img.png)', desc: 'Image' },
        ]},
        { title: 'Quote & Rule', items: [
          { syntax: '> quoted text', desc: 'Blockquote' },
          { syntax: '---', desc: 'Horizontal rule' },
        ]},
        { title: 'Code Block', items: [
          { syntax: '```javascript\ncode here\n```', desc: 'Fenced code block with syntax highlight\nLanguages: js / python / bash / css …' },
        ]},
        { title: 'Table', items: [
          { syntax: '| Col1 | Col2 |\n|------|------|\n| A    | B    |', desc: 'Basic table\nAlign: :--- left / :---: center / ---: right' },
        ]},
        { title: 'Math', items: [
          { syntax: '$E = mc^2$', desc: 'Inline formula (KaTeX)' },
          { syntax: '$$\n\\int_0^1 x\\,dx\n$$', desc: 'Block formula, centered on its own line' },
        ]},
      ],
      features: [
        { title: 'Toolbar', desc: 'Click any toolbar button to insert syntax at the cursor. Select text first to wrap it with bold, italic, etc.' },
        { title: '⊞ Table Builder', desc: 'Click "⊞ Table" to visually pick rows/cols and fill in content. Generates Markdown table automatically.' },
        { title: '∑ Formula Library', desc: 'Click "∑ Formula" to pick from a library of common math expressions. No LaTeX knowledge needed.' },
        { title: '✦ Visual Insert', desc: 'Click "✦ Visual Insert" for a Word-style WYSIWYG editor. Select text and click format buttons to apply styles. Supports tables and images. Converts to Markdown on insert.' },
        { title: 'Paste Image', desc: 'Ctrl+V paste a screenshot directly into the editor. It is auto-converted and inserted as a Markdown image link. Configure storage in ⚙️ Settings.' },
        { title: 'Copy ▾ — Copy Content', desc: 'Click "Copy ▾" to open a dropdown with two options:\n• WeChat: copies styled rich text, ready to paste into WeChat Official Account editor.\n• 52pojie BBCode: copies BBCode text; paste into the 52pojie forum editor in source mode. Supports code highlighting and tables.' },
        { title: 'Export — HTML', desc: 'Click "Export" to download the current preview as a standalone HTML file with syntax highlighting, openable in any browser.' },
        { title: 'File Operations', desc: '• Open: load a local .md / .txt file into the editor.\n• Save (Ctrl+S): download current content as a .md file.\n• ✎ next to the filename: rename the file.' },
        { title: '⚙️ Settings', desc: 'Configure image storage (inline Base64 or local file reference) and interface language (中文 / English).' },
        { title: 'Theme Toggle', desc: 'Click 🌙 / ☀️ in the top bar to switch between dark and light themes. Your preference is saved automatically.' },
        { title: 'Split Drag', desc: 'In Split mode, drag the divider between editor and preview to adjust the width ratio.' },
        { title: 'Focus Mode', desc: 'Click "⊞" to enter focus mode — hides the toolbar and centers the preview for distraction-free writing.' },
        { title: 'Shortcuts', desc: 'Ctrl+S  Save\nCtrl+B  Bold\nCtrl+I  Italic' },
        { title: 'Auto-save', desc: 'Content is auto-saved to browser local storage every second. Refreshing the page restores your last session.' },
        { title: 'Reset', desc: 'Click "Reset" to clear all local data (content, filename, theme, image settings) and restore defaults. A confirmation dialog appears before the action.' },
      ],
    },
    defaultContent: `# Welcome to Markdown Editor

A **Mac-style** Markdown editor with live preview, visual insert, math formulas, and syntax highlighting. Content is auto-saved to your browser — closing the tab won't lose your work. Click **Guide** in the top bar for full documentation.

---

## Quick Start

| Button | Function |
|--------|----------|
| Edit / Split / Preview | Switch views; drag the divider in Split mode |
| ✦ Visual Insert | Word-style editor, auto-converts to Markdown |
| ⊞ Table | Visual table builder |
| ∑ Formula | Math formula library |
| Export | Download as HTML |
| Copy ▾ | Dropdown: WeChat rich text / 52pojie BBCode |
| Reset | Clear local data and restore defaults |

## Shortcuts

| Action | Key |
|--------|-----|
| Save | Ctrl+S |
| Bold | Ctrl+B |
| Italic | Ctrl+I |

## Math Example

Inline: $E = mc^2$　　Block:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Code Highlight Example

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
}
\`\`\`

> Start editing — write Markdown on the left, see the preview on the right.
`,
  }, // end en
}
