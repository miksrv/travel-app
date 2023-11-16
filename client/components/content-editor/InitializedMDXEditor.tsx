'use client'

import {
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    headingsPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    thematicBreakPlugin
} from '@mdxeditor/editor'
import { toolbarPlugin } from '@mdxeditor/editor'
import { diffSourcePlugin } from '@mdxeditor/editor'
import { DiffSourceToggleWrapper } from '@mdxeditor/editor'
import { UndoRedo } from '@mdxeditor/editor'
import { linkPlugin } from '@mdxeditor/editor'
import { imagePlugin } from '@mdxeditor/editor'
import type { ForwardedRef } from 'react'

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            contentEditableClassName={'markdownEditorContent'}
            plugins={[
                diffSourcePlugin({
                    diffMarkdown: props.markdown,
                    viewMode: 'rich-text'
                }),
                headingsPlugin(),
                listsPlugin(),
                linkPlugin(),
                imagePlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <>
                            <DiffSourceToggleWrapper>
                                <UndoRedo />
                            </DiffSourceToggleWrapper>
                        </>
                    )
                })
            ]}
            {...props}
            ref={editorRef}
        />
    )
}
