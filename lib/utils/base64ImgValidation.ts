import { toast } from 'sonner'

export function checkBase64(content: string | null | undefined): boolean {
  if (!content) return false
  const base64regex = /(src=["']data:image\/[a-zA-Z0-9+]+;base64|url\(["']?data:image\/[a-zA-Z0-9+]+;base64)/i
  return base64regex.test(content)
}

export function highlightBase64Images(content: string, showToast = true): string {
  if (!content) return content

  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')

  doc.querySelectorAll('img').forEach(img => {
    if (img.src.startsWith('data:image')) {
      img.style.filter = 'drop-shadow(0 0 10px red)'
    }
  })
  if (showToast) {
    toast.error(
      "Invalid content, base64 encoded data found ⚠️ Highlighted image can't be saved — upload it via the gallery button.",
      { duration: 10000 },
    )
  }
  return doc.body.innerHTML
}
