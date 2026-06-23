import Image from 'next/image'

interface FeedPostTopProps {
  profile_image: string
  full_name: string
  page_url: string
  permalink: string
}

export function FeedPostTop({ profile_image, full_name, page_url, permalink }: FeedPostTopProps) {
  return (
    <div className="flex flex-row justify-between items-center px-2 py-2">
      {/* Left: avatar + name */}
      <div className="flex items-center">
        <a
          href={page_url}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline cursor-pointer"
          aria-label={`Visit ${full_name}'s Instagram profile`}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={profile_image}
              alt={`${full_name} profile picture`}
              fill
              className="object-cover"
            />
          </div>
        </a>
        <span className="px-2">
          <a
            href={page_url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer font-bold no-underline"
            style={{ color: 'black' }}
            aria-label={`Visit ${full_name}'s Instagram profile`}
          >
            {full_name}
          </a>
        </span>
      </div>

      {/* Right: follow + instagram link */}
      <div className="flex items-center">
        <a
          href={page_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 no-underline font-bold"
          style={{ color: 'rgb(56, 151, 240)' }}
          aria-label={`Follow ${full_name} on Instagram`}
        >
          Folow
        </a>
        <a
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline cursor-pointer flex items-center"
          aria-label="View post on Instagram"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M17.1,1H6.9C3.7,1,1,3.7,1,6.9v10.1C1,20.3,3.7,23,6.9,23h10.1c3.3,0,5.9-2.7,5.9-5.9V6.9C23,3.7,20.3,1,17.1,1z M21.5,17.1c0,2.4-2,4.4-4.4,4.4H6.9c-2.4,0-4.4-2-4.4-4.4V6.9c0-2.4,2-4.4,4.4-4.4h10.3c2.4,0,4.4,2,4.4,4.4V17.1z" />
            <path d="M16.9,11.2c-0.2-1.1-0.6-2-1.4-2.8c-0.8-0.8-1.7-1.2-2.8-1.4c-0.5-0.1-1-0.1-1.4,0C10,7.3,8.9,8,8.1,9S7,11.4,7.2,12.7C7.4,14,8,15.1,9.1,15.9c0.9,0.6,1.9,1,2.9,1c0.2,0,0.5,0,0.7-0.1c1.3-0.2,2.5-0.9,3.2-1.9C16.8,13.8,17.1,12.5,16.9,11.2z M12.6,15.4c-0.9,0.1-1.8-0.1-2.6-0.6c-0.7-0.6-1.2-1.4-1.4-2.3c-0.1-0.9,0.1-1.8,0.6-2.6c0.6-0.7,1.4-1.2,2.3-1.4c0.2,0,0.3,0,0.5,0s0.3,0,0.5,0c1.5,0.2,2.7,1.4,2.9,2.9C15.8,13.3,14.5,15.1,12.6,15.4z" />
            <path d="M18.4,5.6c-0.2-0.2-0.4-0.3-0.6-0.3s-0.5,0.1-0.6,0.3c-0.2,0.2-0.3,0.4-0.3,0.6s0.1,0.5,0.3,0.6c0.2,0.2,0.4,0.3,0.6,0.3s0.5-0.1,0.6-0.3c0.2-0.2,0.3-0.4,0.3-0.6C18.7,5.9,18.6,5.7,18.4,5.6z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
