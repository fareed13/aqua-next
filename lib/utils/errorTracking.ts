export function logError(err: unknown, endpoint: string) {
  if (typeof window !== 'undefined') {
    const page = window.location.pathname !== '/' ? window.location.pathname : 'home'
    console.error(`${err} ENDPOINT: ${endpoint} DOMAIN: ${window.location.origin} PAGE: ${page}`)
  } else {
    console.error(`${err} ENDPOINT: ${endpoint} DOMAIN: SSR PAGE: prerender`)
  }
}
