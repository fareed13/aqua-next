import Image from 'next/image'

interface Block {
  type: 'html' | 'image'
  value?: string
  src?: string
  alt?: string
  width?: number
  height?: number
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const raw = content || ''
  if (!raw) return blocks

  const imageRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = imageRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'html', value: raw.slice(lastIndex, match.index) })
    }
    const tag = match[0]
    const altMatch = tag.match(/alt=["']([^"']*)["']/i)
    const widthMatch = tag.match(/width=["']([^"']+)["']/i)
    const heightMatch = tag.match(/height=["']([^"']+)["']/i)
    blocks.push({
      type: 'image',
      src: match[1],
      alt: altMatch?.[1] ?? '',
      width: widthMatch ? parseInt(widthMatch[1], 10) || undefined : undefined,
      height: heightMatch ? parseInt(heightMatch[1], 10) || undefined : undefined,
    })
    lastIndex = imageRegex.lastIndex
  }

  if (lastIndex < raw.length) blocks.push({ type: 'html', value: raw.slice(lastIndex) })
  return blocks.length ? blocks : [{ type: 'html', value: raw }]
}

interface Props {
  html?: string
  defaultAlt?: string
  imageSizes?: string
  imageFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  enableLogging?: boolean
}

export function OptimizedRichText({
  html = '',
  defaultAlt = 'Inline media',
  imageSizes = '(max-width: 767px) 100vw, 800px',
  imageFit = 'contain',
  enableLogging = false,
}: Props) {
  const blocks = parseBlocks(html)

  if (enableLogging && typeof window !== 'undefined') {
    console.log('[OptimizedRichText] raw:', html)
    console.log('[OptimizedRichText] blocks:', blocks)
  }

  return (
    <div className="w-full">
      {blocks.map((block, i) => {
        if (block.type === 'html') {
          return <div key={i} dangerouslySetInnerHTML={{ __html: block.value ?? '' }} />
        }
        return (
          <Image
            key={i}
            src={block.src!}
            alt={block.alt || defaultAlt}
            width={block.width ?? 1000}
            height={block.height ?? 1000}
            sizes={imageSizes}
            style={{ objectFit: imageFit, display: 'block', width: '100%', height: 'auto', margin: '24px auto' }}
            loading="lazy"
          />
        )
      })}
    </div>
  )
}
