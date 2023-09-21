import React from 'react';

interface FeedForComProps {
  subredditName: string;
  iconImage: string | null;
  createdAt: string;
  subscribersCount: number;
}

const formatDate = (dateString: string) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const FeedForCom: React.FC<FeedForComProps> = ({
  subredditName,
  iconImage,
  createdAt,
  subscribersCount,
}) => {
  if (subredditName === 'Product' || subredditName === 'Maker-Log' || subredditName === 'Community') {
    return null;
  }

  const formattedDate = formatDate(createdAt);

  return (
    <div className='rounded-md bg-white shadow mt-8'>
      <div className='px-4 py-4 flex items-start'>
        {iconImage && (
          <div className='w-24 h-24 mr-8 mt-15'>
            <img
              src={iconImage}
              alt={`${subredditName} icon`}
              className='w-full h-full object-cover rounded'
            />
          </div>
        )}

        <div className='flex-grow w-3/4'>
          <div className='max-h-40 mt-1 text-lg text-gray-700'>
            {subredditName && (
              <div>
                <a
                  className='underline text-zinc-900 text-lg underline-offset-2 font-bold'
                  href={`/r/${subredditName}`}
                  style={{ textDecoration: 'none', color: 'black' }}
                >
                  {subredditName}
                </a>
              </div>
            )}

            {/* "Created at"을 날짜 앞에 추가하고 구독자 수를 밑에 표시합니다. */}
            <div className='mt-2 text-xs text-gray-500'>
              <p>Created at: {formattedDate}</p>
              <p>Subscribers: {subscribersCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedForCom;
