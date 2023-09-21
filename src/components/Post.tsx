import { formatTimeToNow } from '@/lib/utils';
import { Post, User, Vote } from '@prisma/client';
import { MessageSquare } from 'lucide-react';
import { Eye } from 'lucide-react'; // 조회수를 나타내기 위한 아이콘 import
import Link from 'next/link';
import { FC, useRef } from 'react';
import EditorOutput from './EditorOutput';
import PostVoteClient from './post-vote/PostVoteClient';

type PartialVote = Pick<Vote, 'type'>;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
    views: number; // 조회수 추가
  };
  votesAmt: number;
  subredditName: string;
  currentVote?: PartialVote;
  commentAmt: number;
}

const PostComponent: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null);

  const isProductSubreddit = subredditName === 'Product'; // Check if the subreddit is "Product"

  // 라스트블락
  const lastBlock = post.content.blocks[post.content.blocks.length - 1];
  const excludeLastBlock = isProductSubreddit && lastBlock?.type === 'image';
  const lastImageUrl = excludeLastBlock ? lastBlock?.data?.file?.url : null;


  return (
    <div className='rounded-md bg-white shadow'>
      <div className='px-4 py-4 flex items-start'> {/* 여기서 justify-between 대신 items-start를 사용하도록 변경 */}
        {/* Thumbnail */}
        {isProductSubreddit && (
          <div
            className='thumbnail rounded-lg border border-gray-300 p-2 w-24 h-24 bg-center bg-cover'
            style={{
              backgroundImage: lastImageUrl ? `url(${lastImageUrl})` : 'none',
            }}
          />
        )}

        {/* Post Content */}
        <div className='ml-4 flex-grow w-3/4'> 
          {/* Subreddit and Author Info */}
          <div className='max-h-40 mt-1 text-xs text-gray-500'>
            {subredditName ? (
              <>
                <a
                  className='underline text-zinc-900 text-sm underline-offset-2'
                  href={`/r/${subredditName}`}>
                  {subredditName === 'Product' || subredditName === 'Maker-Log'
                    ? subredditName
                    : `Community/${subredditName}`}
                </a>
                <span className='px-1'>•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          {/* Post Title */}
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
              {post.title}
            </h1>
          </a>
            {/* Post Content */}
          <div className='relative text-sm max-h-40 w-full overflow-clip' ref={pRef}>
            <EditorOutput content={post.content} excludeLastBlock={isProductSubreddit ? excludeLastBlock : false} />
            {pRef.current?.clientHeight === 160 ? (
              // Add a cover to hide content if it's too long
              <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent'></div>
            ) : null}
          </div>
        </div>

        {/* Vote Component */}
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={_votesAmt}
          initialVote={_currentVote?.type}
        />
      </div>
      
      {/* Comments and Views */}
      <div className='bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6 flex justify-between'>
        <Link
          href={`/r/${subredditName}/post/${post.id}`}
          className='w-fit flex items-center gap-2'>
          <MessageSquare className='h-4 w-4' /> {commentAmt} comments
        </Link>
        <div className='flex items-center gap-2'> {/* 조회수 부분을 오른쪽으로 옮김 */}
          <Eye className='h-4 w-4' /> <span>{post.views} views</span> {/* 조회수와 아이콘 표시 */}
        </div>
      </div>
    </div>
  );
};

export default PostComponent;