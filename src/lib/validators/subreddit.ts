import { z } from 'zod'

export const SubredditValidator = z.object({
  name: z.string().min(3).max(21),
  iconImage: z.string().optional() // if iconImage is a string URL and optional
})

export const SubredditSubscriptionValidator = z.object({
  subredditId: z.string(),
})

export type CreateSubredditPayload = z.infer<typeof SubredditValidator>
export type SubscribeToSubredditPayload = z.infer<
  typeof SubredditSubscriptionValidator
>
