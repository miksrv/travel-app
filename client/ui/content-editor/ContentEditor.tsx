'use client'

import { type MDXEditorMethods, type MDXEditorProps } from '@mdxeditor/editor'
import dynamic from 'next/dynamic'
import { forwardRef } from 'react'

// This is the only place InitializedMDXEditor is imported directly.
const MDXEditor = dynamic(() => import('./InitializedMDXEditor'), {
    // Make sure we turn SSR off
    ssr: false
})

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const ContentEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
    (props, ref) => (
        <MDXEditor
            {...props}
            editorRef={ref}
        />
    )
)

// TS complains without the following line
ContentEditor.displayName = 'ContentEditor'

export default ContentEditor
