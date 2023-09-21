'use client'
import React, { useEffect, useRef } from 'react';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import FeedForCom from './FeedForCom';


const FeedForComContainer = () => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({ root: lastPostRef.current, threshold: 1 });

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['infinite-query'],
    async ({ pageParam = 1 }) => {
      const response = await axios.get(`/api/subreddit?page=${pageParam}`);
      return response.data;
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const subreddits = data?.pages.flatMap((page) => page) ?? [];

  return (
    <div>
      {subreddits.map((subreddit, index) => (
        <FeedForCom
          key={subreddit.name}
          subredditName={subreddit.name}
          iconImage={subreddit.iconImage}
          createdAt={subreddit.createdAt}
          subscribersCount={subreddit.subscribers}
        />
      ))}

      {isFetchingNextPage && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      )}

      <div ref={ref}></div>
    </div>
  );
};

export default FeedForComContainer;

