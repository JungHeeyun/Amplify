import SubscribeLeaveToggle from '@/components/SubscribeLeaveToggle'
import ToFeedButton from '@/components/ToFeedButton'
import { buttonVariants } from '@/components/ui/Button'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Amplify',
  description: 'Ignite your ideas!',
}

const Layout = async ({
  children,
  params: { slug },
}: {
  children: ReactNode
  params: { slug: string }
}) => {
  // console.log('Current slug:', slug); // 콘솔 로그 추가
  const decodedSlug = decodeURIComponent(slug);
  // console.log('Decoded slug:', decodedSlug); // 디코딩된 slug 값 확인
  
  const session = await getAuthSession()
  const userId: string | undefined | null = session?.user?.id;
  if (['Product', 'Maker-Log'].includes(decodedSlug) && userId) {
    const existingSubscription = await db.subscription.findFirst({
        where: {
           subreddit: { name: decodedSlug },
           user: { id: userId },
        },
    });

    if (!existingSubscription) {
        await db.subscription.create({
           data: {
              subreddit: { connect: { name: decodedSlug } },
              user: { connect: { id: userId } },
           },
        });
    }
}


  const subreddit = await db.subreddit.findFirst({
    where: { name: decodedSlug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })
  
  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: decodedSlug,
          },
          user: {
            id: session.user.id,
          },
        },
      })

  const isSubscribed = !!subscription

  if (!subreddit) return notFound()

  const memberCount = await db.subscription.count({
    where: {
      subreddit: {
        name: decodedSlug,
      },
    },
  })

  const showAdditionalInfo = subreddit.name !== 'Product' && subreddit.name !== 'Maker-Log' && subreddit.name !== 'Community';
  

  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
      <div>
        <ToFeedButton />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
          <ul className='flex flex-col col-span-2 space-y-6'>{children}</ul>

          {/* info sidebar */}
          <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
          <div className='px-6 py-4'>
            <p className='font-semibold py-3'>About {subreddit.name}</p>
            {subreddit.name === 'Product' && (
              <p className='py-2'>Product is a community for discussing and sharing products. Share your favorite products, discover new ones, and get feedback on your own products here.</p>
            )}
            {subreddit.name === 'Maker-Log' && (
              <p className='py-2'>Maker-Log is a community for makers to share their daily logs. Share your progress, learn from others, and get inspired!</p>
            )}
            {subreddit.name === 'Community' && (
              <p className='py-2'> Community serves as a strategic platform for founders and investors to engage in meaningful dialogues about investment-worthy ventures.</p>
            )}
          </div>
            <dl className={`divide-y divide-gray-100 px-6 py-4 text-sm leading-6 ${subreddit.name === 'Community' ? 'bg-transparent' : 'bg-white'}`}>
              {showAdditionalInfo && (
                <>
                  <div className='flex justify-between gap-x-4 py-3'>
                    <dt className='text-gray-500'>Created</dt>
                    <dd className='text-gray-700'>
                      <time dateTime={subreddit.createdAt.toDateString()}>
                        {format(subreddit.createdAt, 'MMMM d, yyyy')}
                      </time>
                    </dd>
                  </div>
                  <div className='flex justify-between gap-x-4 py-3'>
                    <dt className='text-gray-500'>Members</dt>
                    <dd className='flex items-start gap-x-2'>
                      <div className='text-gray-900'>{memberCount}</div>
                    </dd>
                  </div>
                </>
              )}
              {subreddit.creatorId === session?.user?.id ? (
                <div className='flex justify-between gap-x-4 py-3'>
                  <dt className='text-gray-500'>You created this Community</dt>
                </div>
              ) : null}
              {showAdditionalInfo && subreddit.creatorId !== session?.user?.id ? (
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              ) : null}
              { (isSubscribed || subreddit.name === 'Product' || subreddit.name === 'Maker-Log') && subreddit.name !== 'Community' && (
                  <Link
                      className={buttonVariants({
                          variant: 'outline',
                          className: 'w-full mb-6',
                      })}
                      href={`r/${slug}/submit`}>
                      Create Post 
                  </Link>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout