'use client'

import { IMarkdownEditor } from '@uiw/react-markdown-editor'
import dynamic from 'next/dynamic'
import React from 'react'

const MarkdownEditor = dynamic(() => import('@uiw/react-markdown-editor'), {
    ssr: false
})

interface ContentEditorProps extends IMarkdownEditor {}

const ContentEditor: React.FC<ContentEditorProps> = (props) => (
    <div data-color-mode={'light'}>
        <MarkdownEditor
            {...props}
            value={props.value || ''}
            previewWidth={'100%'}
            enableScroll={true}
        />
    </div>
)

export default ContentEditor
