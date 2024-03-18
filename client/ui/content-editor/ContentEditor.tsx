'use client'

import '@uiw/react-markdown-preview/markdown.css'
import { MDEditorProps } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import dynamic from 'next/dynamic'
import React from 'react'
import Markdown from 'react-markdown'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
    ssr: false
})

interface ContentEditorProps extends MDEditorProps {}

const ContentEditor: React.FC<ContentEditorProps> = (props) => (
    <div data-color-mode={'light'}>
        <MDEditor
            {...props}
            visibleDragbar={false}
            minHeight={400}
            height={'100%'}
            preview={'edit'}
            components={{
                preview: (content) => <Markdown>{content}</Markdown>
            }}
        />
    </div>
)

export default ContentEditor
