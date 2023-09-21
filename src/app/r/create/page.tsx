'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/hooks/use-toast'
import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { CreateSubredditPayload } from '@/lib/validators/subreddit'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { uploadFiles } from '@/lib/uploadthing';

const Page = () => {
  const router = useRouter()
  const [input, setInput] = useState<string>('')
  const { loginToast } = useCustomToasts()
  
  const [iconImage, setIconImage] = useState<File | null>(null);

  const uploadIconImage = async (file: File) => {
    try {
      const [res] = await uploadFiles([file], 'imageUploader');
      console.log("Uploaded URL:", res.fileUrl);  // for debugging
      return res.fileUrl;
    } catch (error) {
      console.error("Icon image upload failed:", error);
      toast({
        title: 'Upload failed.',
        description: 'Failed to upload the icon image. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIconImage(file);  // 이미지 파일을 상태에 저장
    }
  }
  

  const clearImageSelection = () => {
    setImagePreview(null);
    setIconImage(null);
  };

  

  const { mutate: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      let iconImageUrl: string | undefined;

      if (iconImage) {
        iconImageUrl = await uploadIconImage(iconImage);
        if (!iconImageUrl) {
            // handle the error if the URL is not returned
            throw new Error('Failed to upload the icon image.');
        }
      }

      const payload: CreateSubredditPayload = {
          name: input,
          iconImage: iconImageUrl, // 이제 iconImageUrl는 string 또는 undefined 중 하나입니다.
      };

      const { data } = await axios.post('/api/subreddit', payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: 'Community already exists.',
            description: 'Please choose a different name.',
            variant: 'destructive',
          })
        }

        if (err.response?.status === 422) {
          return toast({
            title: 'Invalid community name.',
            description: 'Please choose a name between 3 and 21 letters.',
            variant: 'destructive',
          })
        }

        if (err.response?.status === 401) {
          return loginToast()
        }
      }

      toast({
        title: 'There was an error.',
        description: 'Could not create community.',
        variant: 'destructive',
      })
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`)
    },
  })

  const hasSpace = (text: string) => /\s/.test(text);

  const handleCreateCommunity = () => {
    if (hasSpace(input)) {
      return toast({
        title: 'Invalid Community Name.',
        description: 'Spaces are not allowed in club names. Consider using a hyphen (-) instead.',
        variant: 'destructive',
      });
    }
    createCommunity();
  };

  return (
    <div className='container flex items-center h-full max-w-3xl mx-auto'>
      <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-xl font-semibold'>Create a Community</h1>
        </div>
        
        <hr className='bg-red-500 h-px' />

        <div className='flex items-start'> {/* 이 부분이 새로 추가된 flex container 입니다 */}
          <div className='mr-4'>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageSelection}
              className='hidden'
              id='image-upload'
            />
            <label htmlFor='image-upload' className='cursor-pointer'>
              <div className='w-32 h-32 rounded-lg border border-gray-300 flex items-center justify-center'>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt='Preview'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='text-gray-500 flex flex-col items-center justify-center'>
                    <span className='text-5xl'>+</span>
                    <span className='block text-sm'>
                      Upload Icon
                    </span>
                  </div>
                )}
              </div>
            </label>
            {iconImage && (
              <div className='mt-2 flex items-center gap-2'>
                <button
                  type='button'
                  onClick={clearImageSelection}
                  className='w-32 h-8 rounded-md bg-red-600 text-white hover:bg-red-700'>
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className='flex-1'>
            <p className='text-lg font-medium'>Company Name</p>
            <p className='text-xs pb-2'>
              Company names including capitalization cannot be changed.
            </p>
            <div className='relative'>
              <p className='absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400'>
              </p>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='pl-6'
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            disabled={isLoading}
            variant='subtle'
            onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={handleCreateCommunity}>
            Create Community
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page
