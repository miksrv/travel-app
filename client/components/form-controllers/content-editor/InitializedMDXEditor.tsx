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
import {
    DiffSourceToggleWrapper,
    UndoRedo,
    diffSourcePlugin,
    imagePlugin,
    linkPlugin,
    toolbarPlugin
} from '@mdxeditor/editor'
import type { ForwardedRef } from 'react'

import styles from './styles.module.sass'

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    return (
        <MDXEditor
            className={styles.editor}
            contentEditableClassName={styles.markdownEditorContent}
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
