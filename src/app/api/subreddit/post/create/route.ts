import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostValidator } from '@/lib/validators/post'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { title, content, subredditId } = PostValidator.parse(body)

    const session = await getAuthSession()

    // get subreddit details
    const subreddit = await db.subreddit.findUnique({
      where: {
        id: subredditId,
      },
    })

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // If subreddit name is 'Product' or 'Maker-Log', user is automatically subscribed
    if (subreddit.name === 'Product' || subreddit.name === 'Maker-Log') {
      const existingSubscription = await db.subscription.findFirst({
        where: {
          subredditId,
          userId: session.user.id,
        },
      })

      if (!existingSubscription) {
        // Automatically subscribe user to 'Product' or 'Maker-Log' subreddit
        await db.subscription.create({
          data: {
            userId: session.user.id,
            subredditId,
          },
        })
      }
    }

    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      },
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not post to subreddit at this time. Please try later',
      { status: 500 }
    )
  }
}
