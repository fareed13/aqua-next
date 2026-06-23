const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''

function waitForImageAvailable(
  imageUrl: string,
  maxAttempts = 20,
  intervalMs = 500
): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0
    const checkImage = () => {
      attempts++
      const img = new (globalThis.Image ?? class { set src(_: string) {} onload() {} onerror() {} })()
      img.onload = () => resolve()
      img.onerror = () => {
        if (attempts >= maxAttempts) resolve()
        else setTimeout(checkImage, intervalMs)
      }
      img.src = imageUrl
    }
    checkImage()
  })
}

export async function uploadFile(file: File, organizationId: number): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

  const data = new FormData()
  data.append('organization_id', String(organizationId))
  data.append('list_media', file)

  const mediaDetails: Record<string, { name: string }> = {}
  mediaDetails[file.name] = { name: file.name }
  data.append('media_detail', JSON.stringify(mediaDetails))

  let token = ''
  if (typeof document !== 'undefined') {
    const match = document.cookie.split('; ').find(c => c.startsWith('auth._token.local='))
    token = match ? decodeURIComponent(match.split('=')[1]) : ''
  }

  const response = await fetch(`${backendUrl}/media/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  })

  if (!response.ok) throw new Error(`Media upload failed [${response.status}]`)

  const result = await response.json()
  const detail = result.detail ?? result
  const fileDetail = detail[file.name] ?? Object.values(detail).find((v: any) => v?.uuid)
  const uuid = (fileDetail as any)?.uuid
  const extension = (fileDetail as any)?.extension

  if (!uuid || !extension) {
    throw new Error('Media upload response missing uuid or extension')
  }

  const url = `${MEDIA_URL}/${uuid}_1000.${extension}`
  await waitForImageAvailable(url)
  return url
}

export function extractInnerContent(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') return content || ''

  const trimmed = content.trim()
  const wrapperPattern =
    /^<div\s+class=["']ql-snow["']>\s*<div\s+class=["']ql-editor\s+text-black["']>([\s\S]*?)<\/div>\s*<\/div>$/
  const match = trimmed.match(wrapperPattern)

  return match?.[1]?.trim() ?? trimmed
}

export function ensureContentWrapper(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') return content ?? ''

  const inner = extractInnerContent(content).trim()
  const hasQlSnow =
    inner.startsWith('<div class="ql-snow">') || inner.startsWith("<div class='ql-snow'>")
  const hasQlEditor =
    inner.includes('<div class="ql-editor text-black">') ||
    inner.includes("<div class='ql-editor text-black'>")

  if (hasQlSnow && hasQlEditor) return inner

  return `<div class="ql-snow"><div class="ql-editor text-black">${inner}</div></div>`
}
