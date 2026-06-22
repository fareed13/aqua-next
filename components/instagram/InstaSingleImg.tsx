import Image from 'next/image'
import { FeedPostTop } from './FeedPostTop'
import { FeedPostBottom } from './FeedPostBottom'

interface InstaSingleImgProps {
  url: string
  postFeed: any
  likes?: number
  showOnlyContent: boolean
  profile?: any
}

export function InstaSingleImg({ url, postFeed, likes = 0, showOnlyContent, profile }: InstaSingleImgProps) {
  const thumbnailUrl =
    postFeed?.media_type === 'CAROUSEL_ALBUM' || postFeed?.media_type === 'IMAGE'
      ? postFeed?.media_url
      : postFeed?.thumbnail_url

  return (
    <div className="insta-single-img border-0">
      {!showOnlyContent && profile && (
        <FeedPostTop
          profile_image={profile.profile_image}
          full_name={profile.full_name}
          page_url={profile.page_url}
          permalink={postFeed?.permalink ?? ''}
        />
      )}

      <div className="relative w-full aspect-square">
        <Image
          src={url}
          alt={postFeed?.caption?.slice(0, 100) || 'Instagram post image'}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>

      {!showOnlyContent && profile && (
        <FeedPostBottom
          likes={likes}
          profile_image={profile.profile_image}
          full_name={profile.full_name}
          page_url={profile.page_url}
          caption={postFeed?.caption ?? ''}
          date={postFeed?.timestamp ?? ''}
          thumbnail={thumbnailUrl ?? ''}
        />
      )}
    </div>
  )
}
