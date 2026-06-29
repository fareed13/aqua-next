'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SectionProps } from '@/components/sections/registry';
import { useNonSecureCalls } from '@/hooks/apiCalls/useApiCalls';
import { InstaVideo } from './InstaVideo';
import { InstaSlider } from './InstaSlider';
import { InstaSingleImg } from './InstaSingleImg';

function kFormatter(num: number): number | string {
  return Math.abs(num) > 999
    ? Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(1)) + 'k'
    : Math.sign(num) * Math.abs(num);
}

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" style={{ fill: 'rgba(255,255,255,0.8)' }} width="24" height="24">
    <path d="M23.467,5.762c-0.118-0.045-0.232-0.068-0.342-0.068c-0.246,0-0.451,0.087-0.615,0.26l-3.76,3.217v5.766l3.76,3.578c0.164,0.173,0.369,0.26,0.615,0.26c0.109,0,0.223-0.023,0.342-0.068C23.822,18.552,24,18.284,24,17.901V6.57C24,6.186,23.822,5.917,23.467,5.762z" />
    <path d="M16.33,4.412c-0.77-0.769-1.696-1.154-2.78-1.154H3.934c-1.084,0-2.01,0.385-2.78,1.154C0.385,5.182,0,6.108,0,7.192v9.616c0,1.084,0.385,2.01,1.154,2.78c0.77,0.77,1.696,1.154,2.78,1.154h9.616c1.084,0,2.01-0.385,2.78-1.154c0.77-0.77,1.154-1.696,1.154-2.78V7.192C17.484,6.108,17.099,5.182,16.33,4.412z M8.742,17.229c-2.888,0-5.229-2.341-5.229-5.229c0-2.888,2.341-5.229,5.229-5.229S13.971,9.112,13.971,12C13.971,14.888,11.63,17.229,8.742,17.229z" />
    <circle cx="8.742" cy="12" r="3.5" />
  </svg>
);

const CarouselIcon = () => (
  <svg viewBox="0 0 45.964 45.964" style={{ fill: 'rgba(255,255,255,0.8)' }} width="24" height="24">
    <path d="M32.399,40.565H11.113v1.297c0,2.24,1.838,4.051,4.076,4.051h26.733c2.239,0,4.042-1.811,4.042-4.051V15.13c0-2.237-1.803-4.068-4.042-4.068h-1.415v21.395C40.507,36.904,36.845,40.566,32.399,40.565z" />
    <path d="M0,4.102l0,28.355c0,2.241,1.814,4.067,4.051,4.067h28.365c2.237,0,4.066-1.826,4.066-4.067l0-28.356c0-2.238-1.828-4.051-4.066-4.051H4.051C1.814,0.05,0,1.862,0,4.102z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="gray">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

export function InstagramFeed({ headline }: SectionProps) {
  const { getPublic, nonSecureEndpoint } = useNonSecureCalls();
  const [showHover, setShowHover] = useState<string | null>(null);
  const [openFeed, setOpenFeed] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [instafeeds, setInstafeeds] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getPublic(nonSecureEndpoint.INSTAGRAM_FEED, {
      domain: process.env.NEXT_PUBLIC_DEFAULT_PAGE_DOMAIN,
    })
      .then((data) => setInstafeeds(data))
      .catch(() => setInstafeeds(null));
  }, []);

  useEffect(() => {
    const checkMobileView = () => setIsMobile(window.innerWidth <= 768);
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const filteredGalleryList = useMemo(() => {
    if (!instafeeds?.posts) return [];
    return showMore ? instafeeds.posts : instafeeds.posts.slice(0, 8);
  }, [instafeeds, showMore]);

  const openFeedPost = useCallback(
    (event: React.MouseEvent, post: any) => {
      setOpenFeed(true);
      setTimeout(() => {
        const closestDiv = (event.target as HTMLElement).closest('.gallery-home') as HTMLElement;
        if (!closestDiv) return;
        const el = closestDiv.querySelector(`#id${post.id}`) as HTMLElement;
        const scrollDiv = closestDiv.querySelector('#scroll_feeds') as HTMLElement;
        if (!el || !scrollDiv) return;

        scrollDiv.scrollTop = el.offsetTop;

        const videos = scrollDiv.getElementsByTagName('video');
        const makeObserver = () =>
          new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                if (entry.isIntersecting) {
                  if (!isMobile) {
                    video.play();
                  } else {
                    video.setAttribute('controls', 'true');
                  }
                } else {
                  video.pause();
                }
              });
            },
            { root: scrollDiv, threshold: 0.8 },
          );

        Array.from(videos).forEach((video) => makeObserver().observe(video));

        if (!isMobile) {
          Array.from(videos).forEach((video) => makeObserver().observe(video));
        } else {
          Array.from(videos).forEach((video) => {
            video.addEventListener('click', function () {
              if (video.getAttribute('data-playing') !== 'true') {
                video.play();
                video.setAttribute('data-playing', 'true');
              }
            });
          });
        }
      }, 500);
    },
    [isMobile],
  );

  const closeFeedPost = () => setOpenFeed(false);

  return (
    <div
      className="insta-feed"
      style={{
        marginTop: '4rem',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Roboto, "Open Sans", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Desktop heading */}
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="hidden md:block text-center text-2xl font-bold">
          {headline || 'Follow us on Instagram'}
        </h2>
      </div>

      {/* Mobile heading + outside close button */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div
          className={`flex items-center ${openFeed ? 'justify-between bg-[#f8f8f8] border-b border-[#f1f1f1]' : 'justify-center'}`}
        >
          <button
            onClick={closeFeedPost}
            className="md:hidden"
            style={{ display: openFeed ? 'inline-flex' : 'none' }}
            aria-label="Close Instagram feed"
          >
            <CloseIcon />
          </button>
          <h3 className="md:hidden flex items-center justify-center text-lg font-semibold py-2">
            {headline || 'Follow us on Instagram'}
          </h3>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="gallery-home relative z-[1] py-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" style={{ margin: '1rem auto' }}>
            {filteredGalleryList.map((post: any) => (
              <div
                key={post.id}
                className="instagram-post-container"
                style={{ aspectRatio: '1 / 0.9', padding: 0, cursor: 'pointer' }}
                onClick={(e) => openFeedPost(e, post)}
                aria-label={`View Instagram post${post.caption ? ': ' + post.caption.slice(0, 50) : ''}`}
              >
                <div
                  className="insta-post relative h-full w-full"
                  onMouseEnter={() => setShowHover(post.id)}
                  onMouseLeave={() => setShowHover(null)}
                  onTouchStart={() => setShowHover(post.id)}
                >
                  {/* Media type icon */}
                  {showHover !== post.id && (
                    <div
                      className="top-icons"
                      style={{
                        position: 'absolute',
                        zIndex: 2,
                        right: 10,
                        top: 5,
                        width: 'fit-content',
                        color: 'white',
                      }}
                    >
                      {post.media_type === 'VIDEO' && <VideoIcon />}
                      {post.media_type === 'CAROUSEL_ALBUM' && <CarouselIcon />}
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative h-full w-full">
                    <Image
                      src={post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url}
                      alt={
                        post.caption?.slice(0, 100) ||
                        (post.media_type === 'VIDEO' ? 'Instagram video post' : 'Instagram post')
                      }
                      fill
                      className="object-cover insta-post-image"
                      loading="lazy"
                    />
                  </div>

                  {/* Hover overlay */}
                  <div
                    className="insta-content"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      height: '100%',
                      width: '100%',
                      pointerEvents: 'none',
                      visibility: showHover === post.id ? 'visible' : 'hidden',
                      filter: showHover === post.id ? 'grayscale(1)' : 'none',
                      transition: '0.5s ease',
                      backgroundColor: showHover === post.id ? 'rgba(0,0,0,0.8)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ color: 'white', textAlign: 'center' }}>
                      <div className="flex flex-row justify-center post-reach">
                        <div className="flex flex-row items-center px-2">
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="ml-1">{kFormatter(post.like_count)}</span>
                        </div>
                        <div className="flex flex-row items-center px-2">
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="ml-1">{kFormatter(post.comments_count)}</span>
                        </div>
                      </div>
                      <p className="text-center text-sm mt-1 px-2">{post.caption?.slice(0, 40)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feed detail overlay */}
          {openFeed && (
            <div
              className="gallery-feeds"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 3,
              }}
            >
              {/* Inside close button (desktop only) */}
              <div
                className="close-feed-btn-inside hidden md:block mx-2 my-2 text-center"
                style={{ position: 'absolute', top: 0, left: '50%', width: '53%' }}
              >
                <button onClick={closeFeedPost} style={{ cursor: 'pointer' }} aria-label="Close Instagram feed">
                  <CloseIcon />
                </button>
              </div>

              <div
                id="scroll_feeds"
                className="scroll-feeds"
                style={{ overflowY: 'scroll', height: '100%', scrollBehavior: 'smooth' }}
              >
                <div
                  className="insta-feed-posts"
                  style={{ width: '100%', margin: 'auto', height: '100%', backgroundColor: 'white' }}
                >
                  <div className="flex flex-row">
                    <div className="relative">
                      {filteredGalleryList.map((postFeed: any, i: number) => (
                        <div key={postFeed.id} id={`id${postFeed.id}`}>
                          {postFeed.media_type === 'VIDEO' ? (
                            <InstaVideo
                              url={postFeed.media_url}
                              postFeed={postFeed}
                              profile={instafeeds?.profile}
                              likes={kFormatter(postFeed.like_count) as number}
                              showOnlyContent={false}
                            />
                          ) : postFeed.media_type === 'CAROUSEL_ALBUM' ? (
                            <InstaSlider
                              postFeed={postFeed}
                              profile={instafeeds?.profile}
                              likes={kFormatter(postFeed.like_count) as number}
                            />
                          ) : (
                            <InstaSingleImg
                              url={postFeed.media_url}
                              postFeed={postFeed}
                              profile={instafeeds?.profile}
                              likes={kFormatter(postFeed.like_count) as number}
                              showOnlyContent={false}
                            />
                          )}
                          {i !== filteredGalleryList.length - 1 && <hr />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show More / Show Less */}
      {instafeeds?.posts && instafeeds.posts.length > 8 && (
        <div className="text-center pb-2 load-more-btn">
          <button
            className="px-6 py-2 bg-[var(--org-primary,#1976d2)] text-white rounded hover:opacity-90 transition-opacity"
            onClick={() => {
              setShowMore(!showMore);
              setOpenFeed(false);
            }}
            aria-label={showMore ? 'Show fewer Instagram posts' : 'Show more Instagram posts'}
          >
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}

      <style>{`
        .insta-feed * {
          font-family: -apple-system, BlinkMacSystemFont, Roboto, "Open Sans", "Helvetica Neue", sans-serif !important;
        }
        .instagram-post-container {
          min-height: 100px;
        }
        @media only screen and (min-width: 700px) {
          .instagram-post-container {
            min-height: 235px;
          }
        }
        @media only screen and (min-width: 1400px) {
          .instagram-post-container {
            min-height: 254px;
          }
        }
        @media only screen and (min-width: 768px) {
          .insta-feed-posts {
            width: 50% !important;
          }
        }
        .insta-name,
        .post-desc > a {
          text-decoration: none;
        }
        .insta-name:hover,
        .post-desc > a:hover {
          text-decoration: underline;
        }
        .insta-name {
          color: black;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
