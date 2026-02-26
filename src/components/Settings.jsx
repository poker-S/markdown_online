import { useState } from 'react'

export default function Settings({ config, onSave, onClose }) {
  const [service, setService] = useState(config?.service || 'base64')
  const [token, setToken] = useState(config?.token || '')
  const [endpoint, setEndpoint] = useState(config?.endpoint || '')
  const [fieldName, setFieldName] = useState(config?.fieldName || 'file')
  const [urlPath, setUrlPath] = useState(config?.urlPath || 'url')

  const handleSave = () => {
    onSave({ service, token, endpoint, fieldName, urlPath })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">图片上传设置</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>上传方式</label>
            <select value={service} onChange={e => setService(e.target.value)}>
              <option value="base64">内嵌 Base64（无需配置，链接较长）</option>
              <option value="smms">SM.MS 图床（需要 API Token）</option>
              <option value="custom">自定义接口</option>
            </select>
          </div>

          {service === 'smms' && (
            <div className="form-group">
              <label>SM.MS API Token</label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="在 sm.ms 注册后获取"
              />
              <p className="form-hint">
                前往 <a href="https://sm.ms" target="_blank" rel="noreferrer">sm.ms</a> 注册，在「User」→「API Token」页面获取
              </p>
            </div>
          )}

          {service === 'custom' && (
            <>
              <div className="form-group">
                <label>上传接口 URL</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={e => setEndpoint(e.target.value)}
                  placeholder="https://your-api.com/upload"
                />
              </div>
              <div className="form-group">
                <label>文件字段名</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={e => setFieldName(e.target.value)}
                  placeholder="file"
                />
              </div>
              <div className="form-group">
                <label>响应中 URL 的路径</label>
                <input
                  type="text"
                  value={urlPath}
                  onChange={e => setUrlPath(e.target.value)}
                  placeholder="data.url"
                />
                <p className="form-hint">用点号表示嵌套，例如响应为 {`{ "data": { "url": "..." } }`} 则填 data.url</p>
              </div>
              <div className="form-group">
                <label>Authorization Token（可选）</label>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="Bearer xxx"
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button className="btn-save" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
