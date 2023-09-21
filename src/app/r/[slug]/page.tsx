import MiniCreatePost from '@/components/MiniCreatePost'
import PostFeed from '@/components/PostFeed'
import PostFeedforCom from '@/components/PostFeedforCom'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'


interface PageProps {
  params: {
    slug: string
  }
}

const page = async ({ params }: PageProps) => {
  const { slug } = params
  const decodedSlug = decodeURIComponent(slug);

  const session = await getAuthSession()

  const subreddit = await db.subreddit.findFirst({
    where: { name: decodedSlug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  })

  if (!subreddit) return notFound()

  return (
    <>
      <div className='flex items-center'>
        {subreddit.iconImage && (
          <img 
            src={subreddit.iconImage} 
            alt={`${subreddit.name} icon`} 
            className='w-20 h-20 mr-4 rounded' // 높이와 너비는 원하는 크기로 조절 가능
          />
        )}
        <h1 className='font-bold text-3xl md:text-4xl h-14'>
          {subreddit.name}
        </h1>
        </div>
        {subreddit.name !== "Community" && <MiniCreatePost session={session} />}
        {subreddit.name === "Community" && (session 
            ? <PostFeedforCom excludeSubreddits={["Product", "Maker-Log"]} /> 
            : <PostFeedforCom excludeSubreddits={["Product", "Maker-Log"]} />)}
        {subreddit.name !== "Community" && <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />}
    </>
  )
}

export default page
