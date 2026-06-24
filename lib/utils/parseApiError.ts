export function parseApiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  const jsonStart = msg.indexOf('{')
  if (jsonStart !== -1) {
    try {
      const body = JSON.parse(msg.slice(jsonStart))
      return (
        body?.detail ||
        body?.message ||
        (Array.isArray(body?.non_field_errors) ? body.non_field_errors[0] : null) ||
        (Object.values(body)[0] as string) ||
        msg
      )
    } catch {}
  }
  return msg
}
