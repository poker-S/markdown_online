# Changelog

All notable changes to this project will be documented in this file.

---

## [v1.1.0] - 2026-02-27

### 新功能 / New Features

- **中英文双语界面 / i18n Support**
  界面语言支持中文与英文切换，可在 ⚙️ 设置中随时切换。切换后默认欢迎内容同步更新为对应语言版本。
  The UI now supports Chinese and English. Switch anytime in ⚙️ Settings. The default welcome content updates automatically when the language changes.

- **可视化插入 · 格式按钮激活状态 / Visual Insert · Active Format Indicators**
  工具栏格式按钮（加粗、斜体、标题等）会实时高亮显示当前光标处已激活的格式，与 Word 行为一致。
  Toolbar format buttons (bold, italic, headings, etc.) now highlight to reflect the active formatting at the cursor position, matching Word-style behavior.

- **可视化插入 · 清空按钮 / Visual Insert · Clear Button**
  底部新增「清空」按钮，点击后弹出确认提示，确认后清空编辑区全部内容。
  A "Clear" button is now available in the footer. It prompts for confirmation before clearing all content in the editor.

- **可视化插入 · 草稿本地存储 / Visual Insert · Draft Persistence**
  编辑区内容实时保存到浏览器本地存储，关闭弹窗后重新打开自动恢复上次内容。点击「确认插入」后草稿自动清除。
  Editor content is saved to localStorage in real time. Closing and reopening the modal restores the last draft. The draft is cleared automatically after a successful insert.

### Bug 修复 / Bug Fixes

- 修复语言切换后默认欢迎内容未同步更新的问题
  Fixed: default welcome content not updating after switching language

- 修复编辑器空白行光标不显示的问题
  Fixed: cursor not visible on empty lines in the CodeMirror editor

- 修复可视化插入点击「开始使用」后出现白屏的问题
  Fixed: white screen crash after clicking "Get Started" in Visual Insert

- 修复格式按钮（加粗等）在无文字选中状态下无法取消激活的问题
  Fixed: format buttons (bold, etc.) unable to toggle off when no text is selected

- 修复点击可视化插入弹窗外部区域意外关闭弹窗的问题
  Fixed: clicking outside the Visual Insert modal accidentally closing it

---

## [v1.0.0] - Initial Release

初始版本发布。
Initial release.
