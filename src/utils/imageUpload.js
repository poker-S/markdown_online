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

export async function uploadImage(file, config) {
  if (config?.service === 'local') {
    return toLocalRef(file)
  }
  return await fileToBase64(file)
}

