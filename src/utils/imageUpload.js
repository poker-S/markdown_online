const DEFAULT_IMAGE_SERVICE = import.meta.env.VITE_DEFAULT_IMAGE_SERVICE === 'r2' ? 'r2' : 'base64'
const DEFAULT_UPLOAD_ENDPOINT = import.meta.env.VITE_IMAGE_UPLOAD_ENDPOINT || '/api/images/upload'

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function toLocalRef(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `./images/${safeName}`
}

export function getDefaultUploadConfig() {
  return { service: DEFAULT_IMAGE_SERVICE }
}

export function normalizeUploadConfig(config) {
  const service = ['base64', 'local', 'r2'].includes(config?.service)
    ? config.service
    : DEFAULT_IMAGE_SERVICE
  return { service }
}

async function uploadToHostedImageService(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(DEFAULT_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {}

  if (!response.ok) {
    throw new Error(payload?.error || `Upload failed with status ${response.status}`)
  }

  if (!payload?.url) {
    throw new Error('Upload service did not return an image URL.')
  }

  return payload.url
}

export async function uploadImage(file, config) {
  if (config?.service === 'local') {
    return toLocalRef(file)
  }
  if (config?.service === 'r2') {
    return await uploadToHostedImageService(file)
  }
  return await fileToBase64(file)
}
