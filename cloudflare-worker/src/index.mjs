const MIME_TO_EXTENSION = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

const MANAGED_KEY_PATTERN = /^\d{14}(?:-[a-z0-9]+)?\.(png|jpg|webp|gif)$/i

function jsonResponse(data, options = {}) {
  const { status = 200, headers = {} } = options
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}

function getEnvNumber(env, key, fallback) {
  const raw = Number(env[key])
  return Number.isFinite(raw) && raw > 0 ? raw : fallback
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function resolveRequestOrigin(request) {
  const origin = request.headers.get('Origin')
  if (origin) return origin

  const referer = request.headers.get('Referer')
  if (!referer) return ''

  try {
    return new URL(referer).origin
  } catch {
    return ''
  }
}

function getCorsHeaders(request, env) {
  const origin = resolveRequestOrigin(request)
  const allowedOrigins = getAllowedOrigins(env)
  if (!origin || (allowedOrigins.length && !allowedOrigins.includes(origin))) {
    return null
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function getTimeZone(env) {
  return env.UPLOAD_TIMEZONE || 'Asia/Shanghai'
}

function getPublicBaseUrl(env) {
  return trimTrailingSlash(env.PUBLIC_BASE_URL || 'https://i.markdowneditor.cloud')
}

function formatTimestamp(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`
}

function buildManagedKey(timestamp, extension, suffix = '') {
  return `${timestamp}${suffix}.${extension}`
}

async function buildUniqueKey(bucket, timestamp, extension) {
  const baseKey = buildManagedKey(timestamp, extension)
  if (!await bucket.head(baseKey)) {
    return baseKey
  }

  for (let index = 1; index <= 20; index += 1) {
    const numberedKey = buildManagedKey(timestamp, extension, `-${index}`)
    if (!await bucket.head(numberedKey)) {
      return numberedKey
    }
  }

  return buildManagedKey(timestamp, extension, `-${crypto.randomUUID().slice(0, 8)}`)
}

function getExtension(file) {
  return MIME_TO_EXTENSION.get(file.type) || null
}

function isManagedKey(key) {
  return MANAGED_KEY_PATTERN.test(key)
}

function getTimestampPrefix(key) {
  const match = key.match(/^(\d{14})/)
  return match ? match[1] : ''
}

async function runCleanup(env) {
  const retentionDays = getEnvNumber(env, 'RETENTION_DAYS', 30)
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  const cutoffTimestamp = formatTimestamp(cutoffDate, getTimeZone(env))

  let cursor
  let deleted = 0
  let scanned = 0

  do {
    const page = await env.IMAGES.list({ cursor, limit: 1000 })
    const keysToDelete = page.objects
      .map(object => object.key)
      .filter(isManagedKey)
      .filter(key => getTimestampPrefix(key) <= cutoffTimestamp)

    scanned += page.objects.length

    if (keysToDelete.length) {
      await env.IMAGES.delete(keysToDelete)
      deleted += keysToDelete.length
    }

    cursor = page.truncated ? page.cursor : undefined
  } while (cursor)

  console.log(JSON.stringify({
    action: 'cleanup',
    retentionDays,
    cutoffTimestamp,
    scanned,
    deleted,
  }))

  return { retentionDays, cutoffTimestamp, scanned, deleted }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      const corsHeaders = getCorsHeaders(request, env)
      if (!corsHeaders) {
        return new Response(null, { status: 403 })
      }
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (url.pathname === '/api/images/health') {
      return jsonResponse({
        success: true,
        service: 'markdown-editor-images',
        retentionDays: getEnvNumber(env, 'RETENTION_DAYS', 30),
        publicBaseUrl: getPublicBaseUrl(env),
      })
    }

    if (url.pathname === '/api/images/cleanup' && request.method === 'POST') {
      const adminToken = env.CLEANUP_API_TOKEN
      if (!adminToken || request.headers.get('Authorization') !== `Bearer ${adminToken}`) {
        return jsonResponse({ success: false, error: 'Unauthorized.' }, { status: 401 })
      }

      const result = await runCleanup(env)
      return jsonResponse({ success: true, ...result })
    }

    if (url.pathname !== '/api/images/upload') {
      return jsonResponse({ success: false, error: 'Not found.' }, { status: 404 })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed.' }, { status: 405 })
    }

    const corsHeaders = getCorsHeaders(request, env)
    if (!corsHeaders) {
      return jsonResponse({ success: false, error: 'Origin not allowed.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return jsonResponse({ success: false, error: 'No image file was provided.' }, { status: 400, headers: corsHeaders })
    }

    const maxUploadBytes = getEnvNumber(env, 'MAX_UPLOAD_BYTES', 10 * 1024 * 1024)
    if (file.size <= 0 || file.size > maxUploadBytes) {
      return jsonResponse({
        success: false,
        error: `Image must be between 1 byte and ${maxUploadBytes} bytes.`,
      }, { status: 400, headers: corsHeaders })
    }

    const extension = getExtension(file)
    if (!extension) {
      return jsonResponse({
        success: false,
        error: 'Unsupported image type. Please upload PNG, JPG, WEBP, or GIF.',
      }, { status: 400, headers: corsHeaders })
    }

    const timestamp = formatTimestamp(new Date(), getTimeZone(env))
    const key = await buildUniqueKey(env.IMAGES, timestamp, extension)
    const uploadedAt = new Date().toISOString()

    await env.IMAGES.put(key, file, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: 'inline',
        cacheControl: env.IMAGE_CACHE_CONTROL || 'public, max-age=2592000, immutable',
      },
      customMetadata: {
        managedBy: 'markdown-editor-worker',
        uploadedAt,
        originalName: file.name.slice(0, 200),
      },
    })

    return jsonResponse({
      success: true,
      key,
      url: `${getPublicBaseUrl(env)}/${key}`,
      uploadedAt,
    }, { headers: corsHeaders })
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runCleanup(env))
  },
}
