'use client'

import CustomCodeRenderer from '@/components/renderers/CustomCodeRenderer'
import CustomImageRenderer from '@/components/renderers/CustomImageRenderer'
import { FC } from 'react'
import dynamic from 'next/dynamic'

const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  { ssr: false }
)

interface EditorOutputProps {
  content: any;
  excludeLastBlock?: boolean; // 마지막 블록을 제외할지 여부를 나타내는 새로운 prop
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
}

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
}

const EditorOutput: FC<EditorOutputProps> = ({ content, excludeLastBlock = false }) => {
  const blocksToRender = excludeLastBlock
    ? content.blocks.slice(0, -1)
    : content.blocks;

  return (
    <Output
      style={style}
      className='text-sm'
      renderers={renderers}
      data={{ blocks: blocksToRender }}
    />
  );
};


export default EditorOutput
