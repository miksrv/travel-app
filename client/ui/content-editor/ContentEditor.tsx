'use client'

import { IMarkdownEditor } from '@uiw/react-markdown-editor'
import dynamic from 'next/dynamic'
import React from 'react'

import styles from './styles.module.sass'

const MarkdownEditor = dynamic(() => import('@uiw/react-markdown-editor'), {
    ssr: false
})

interface ContentEditorProps extends IMarkdownEditor {}

const ContentEditor: React.FC<ContentEditorProps> = (props) => (
    <div className={styles.contentEditor}>
        <MarkdownEditor
            {...props}
            toolbars={[
                'bold',
                'italic',
                'header',
                'strike',
                'underline',
                'quote',
                'link',
                'image'
            ]}
            value={props.value || ''}
            previewWidth={'100%'}
            enableScroll={true}
        />
    </div>
)

export default ContentEditor
