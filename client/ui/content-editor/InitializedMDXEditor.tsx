'use client'

import {
    DiffSourceToggleWrapper,
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    UndoRedo,
    diffSourcePlugin,
    headingsPlugin,
    imagePlugin,
    linkPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin
} from '@mdxeditor/editor'
import type { ForwardedRef } from 'react'

import styles from './styles.module.sass'

const InitializedMDXEditor = ({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) => (
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

export default InitializedMDXEditor
