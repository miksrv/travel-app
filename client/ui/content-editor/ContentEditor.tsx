'use client'

import React from 'react'
import dynamic from 'next/dynamic'

import styles from './styles.module.sass'

import { concatClassNames as cn } from '@/functions/helpers'
import Spinner from '@/ui/spinner'
import { IMarkdownEditor } from '@uiw/react-markdown-editor'

const MarkdownEditor = dynamic(() => import('@uiw/react-markdown-editor'), {
    loading: () => (
        <div className={styles.loader}>
            <Spinner />
        </div>
    ),
    ssr: false
})

type ContentEditorProps = IMarkdownEditor & { disabled?: boolean }

const ContentEditor: React.FC<ContentEditorProps> = (props) => (
    <div className={cn(styles.contentEditor, props?.disabled && styles.disabled)}>
        <MarkdownEditor
            {...props}
            toolbars={['bold', 'italic', 'header', 'strike', 'underline', 'quote', 'link', 'image']}
            value={props.value || ''}
            previewWidth={'100%'}
            enableScroll={true}
        />
    </div>
)

export default ContentEditor
