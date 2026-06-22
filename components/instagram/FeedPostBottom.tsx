interface FeedPostBottomProps {
  likes: number
  profile_image: string
  full_name: string
  page_url: string
  caption: string
  date: string
  thumbnail: string
}

function convertToLinks(text: string): string {
  const regex = /([#@]\w+)/g
  return text.replace(regex, match => {
    if (match.startsWith('@')) {
      const username = match.substring(1)
      return `<a href="https://www.instagram.com/${username}/" style="color:inherit">${match}</a>`
    } else {
      const keyword = match.substring(1)
      return `<a href="https://www.instagram.com/explore/tags/${keyword}/" style="color:inherit">${match}</a>`
    }
  })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit' }).toUpperCase()
}

export function FeedPostBottom({
  likes,
  full_name,
  page_url,
  caption,
  date,
  thumbnail,
}: FeedPostBottomProps) {
  return (
    <>
      <div className="flex flex-row justify-between px-2 py-2">
        <div>
          <b>{likes}&nbsp;likes</b>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={thumbnail}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline cursor-pointer"
            style={{ color: 'black' }}
            aria-label="Share Instagram post"
          >
            <svg viewBox="0 0 16 16" style={{}} width="16" height="16">
              <g>
                <path d="M15.7,6.8l-7-5.6C8.6,1.1,8.4,1.1,8.3,1.1C8.1,1.2,8,1.4,8,1.6v2.9c-3.8,0.1-5.5,1.5-6.9,4C0,10.5,0,13,0,14.7c0,0.1,0,0.3,0,0.4c0,0.2,0.1,0.8,0.7,0.8s0.7-0.3,0.8-0.5c2.6-4.6,3.6-4.8,6.5-4.8v2.8c0,0.2,0.1,0.4,0.3,0.4c0.1,0.1,0.4,0.1,0.5-0.1l7-5.7C16.1,7.6,16.1,7.2,15.7,6.8z M9.2,11.6V9.8c0-0.1-0.1-0.3-0.1-0.4C9,9.4,8.8,9.3,8.7,9.3c-1.9,0-3,0-4.4,0.6c-1.3,0.6-2,1.6-3,3.2c0.1-1.4,0.2-2.6,1-4C3.5,6.8,5,5.7,8.7,5.7c0.3,0,0.5-0.2,0.5-0.5V3.1l5.2,4.4L9.2,11.6z" />
              </g>
            </svg>
          </a>
          <a
            href={thumbnail}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline cursor-pointer text-sm"
            style={{ color: 'black' }}
            aria-label="Share Instagram post"
          >
            &nbsp; Share
          </a>
        </div>
      </div>

      <div className="flex flex-row justify-between px-2 pb-2">
        <div>
          <a
            href={page_url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer font-bold"
            style={{ color: 'black' }}
            aria-label={`Visit ${full_name}'s Instagram profile`}
          >
            {full_name}
          </a>
          &nbsp;
          {caption && (
            <span
              className="inline text-sm"
              dangerouslySetInnerHTML={{ __html: convertToLinks(caption) }}
            />
          )}
          <p className="text-[10px] opacity-60 uppercase mt-2 mb-2">{formatDate(date)}</p>
        </div>
      </div>
    </>
  )
}
