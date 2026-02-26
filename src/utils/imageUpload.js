export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file, config) {
  if (!config || !config.service || config.service === 'base64') {
    return await fileToBase64(file)
  }
  if (config.service === 'smms') {
    return await uploadToSMMS(file, config.token)
  }
  if (config.service === 'custom') {
    return await uploadToCustom(file, config)
  }
  return await fileToBase64(file)
}

async function uploadToSMMS(file, token) {
  const formData = new FormData()
  formData.append('smfile', file)
  const res = await fetch('https://sm.ms/api/v2/upload', {
    method: 'POST',
    headers: { Authorization: token },
    body: formData,
  })
  const data = await res.json()
  if (data.code === 'success') return data.data.url
  if (data.code === 'image_repeated') return data.images
  throw new Error(data.message || '上传失败')
}

async function uploadToCustom(file, config) {
  let parsed
  try { parsed = new URL(config.endpoint) } catch { throw new Error('无效的上传接口 URL') }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('上传接口必须使用 HTTP/HTTPS 协议')
  const formData = new FormData()
  formData.append(config.fieldName || 'file', file)
  const headers = {}
  if (config.token) headers['Authorization'] = config.token
  const res = await fetch(config.endpoint, { method: 'POST', headers, body: formData })
  const data = await res.json()
  const url = (config.urlPath || 'url').split('.').reduce((obj, k) => obj?.[k], data)
  if (!url) throw new Error('无法从响应中获取图片 URL')
  return url
}
