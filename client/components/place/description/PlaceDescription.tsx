import Link from 'next/link'
import React, { useEffect } from 'react'
import Markdown from 'react-markdown'

import Button from '@/ui/button'
import ChipsSelect from '@/ui/chips-select'
import Container from '@/ui/container'
import ContentEditor from '@/ui/content-editor'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { Tag } from '@/api/types/Place'

import styles from './styles.module.sass'

interface PlaceDescriptionProps {
    id?: string
    content?: string
    tags?: Tag[]
}

const PlaceDescription: React.FC<PlaceDescriptionProps> = (props) => {
    const { id, content, tags } = props

    const [savePlace, { isLoading, data: saveData }] =
        API.usePlacesPatchItemMutation()

    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)
    const [editorMode, setEditorMode] = React.useState<boolean>(false)
    const [editorContent, setEditorContent] = React.useState<string>()
    const [editorTags, setEditorTags] = React.useState<string[]>()

    const handleSetEditorClick = () => {
        setEditorTags(tags?.map((tag) => tag.title) || [])
        setEditorMode(!editorMode)
    }

    const handleSelectTags = (value: string[]) => {
        setEditorTags(value)
    }

    const handleSaveEditorClick = async () => {
        if (!id) {
            return
        }

        setEditorMode(false)

        await savePlace({
            content: editorContent,
            id,
            tags: editorTags
        })
    }

    useEffect(() => {
        if (saveData?.status && editorMode) {
            setEditorMode(false)
            setEditorContent(undefined)
        }
    }, [saveData])

    useEffect(() => {
        setEditorTags(tags?.map(({ title }) => title))
    }, [tags])

    return (
        <Container
            className={styles.component}
            title={'Описание'}
            action={
                isAuth && editorMode ? (
                    <>
                        <Button
                            mode={'secondary'}
                            disabled={isLoading}
                            onClick={handleSaveEditorClick}
                        >
                            {'Сохранить'}
                        </Button>
                        <Button
                            mode={'secondary'}
                            disabled={isLoading}
                            onClick={handleSetEditorClick}
                        >
                            {'Отмена'}
                        </Button>
                    </>
                ) : (
                    <Button
                        icon={'Pencil'}
                        onClick={handleSetEditorClick}
                    >
                        {'Редактировать'}
                    </Button>
                )
            }
        >
            {isAuth && editorMode ? (
                <ContentEditor
                    markdown={content || ''}
                    onChange={setEditorContent}
                />
            ) : content ? (
                <Markdown>{content}</Markdown>
            ) : (
                <div className={styles.emptyContent}>{'Нет описания'}</div>
            )}

            {isAuth && editorMode ? (
                <div className={styles.formElement}>
                    <ChipsSelect
                        label={'Выберите или добавьте метки интересного места'}
                        placeholder={''}
                        value={editorTags}
                        loading={searchLoading}
                        options={searchResult?.items}
                        onSearch={(value) => searchTags(value)}
                        onSelect={handleSelectTags}
                    />
                </div>
            ) : (
                !!tags?.length && (
                    <ul className={styles.tagList}>
                        {tags?.map((tag) => (
                            <li key={tag.id}>
                                <Link href={`/tags/${tag.id}`}>
                                    {`#${tag.title}`}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </Container>
    )
}

export default PlaceDescription
