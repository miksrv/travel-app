import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Markdown from 'react-markdown'

import Button from '@/ui/button'
import ChipsSelect from '@/ui/chips-select'
import Container from '@/ui/container'
import ContentEditor from '@/ui/content-editor'
import ScreenSpinner from '@/ui/screen-spinner'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Tag } from '@/api/types/Place'

import styles from './styles.module.sass'

interface PlaceDescriptionProps {
    placeId?: string
    content?: string
    tags?: Tag[]
}

const PlaceDescription: React.FC<PlaceDescriptionProps> = ({
    placeId,
    content,
    tags
}) => {
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [updatePlace, { data: saveData, isLoading, isSuccess }] =
        API.usePlacesPatchItemMutation()

    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const [editorMode, setEditorMode] = useState<boolean>(false)
    const [editorContent, setEditorContent] = useState<string>()
    const [editorTags, setEditorTags] = useState<string[]>()

    const [localTags, setLocalTags] = useState<Tag[]>()
    const [localContent, setLocalContent] = useState<string>()

    const handleSetEditorClick = () => {
        if (isAuth) {
            setEditorMode(!editorMode)
            setEditorTags(localTags?.map(({ title }) => title))
        } else {
            dispatch(openAuthDialog())
        }
    }

    const handleSelectTags = (value: string[]) => {
        setEditorTags(value)
    }

    const handleSaveEditorClick = async () => {
        await updatePlace({
            content: editorContent,
            id: placeId!,
            tags: editorTags
        })
    }

    useEffect(() => {
        if (isSuccess && editorMode) {
            setEditorMode(false)
            setLocalContent(saveData?.content)
            setLocalTags(saveData?.tags)
            setEditorContent(undefined)
        }
    }, [saveData])

    useEffect(() => {
        setLocalContent(content)
        setLocalTags(tags)
    }, [placeId])

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
            {isLoading && <ScreenSpinner />}

            {isAuth && editorMode ? (
                <ContentEditor
                    markdown={content || ''}
                    onChange={setEditorContent}
                />
            ) : localContent ? (
                <Markdown>{localContent}</Markdown>
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
                localTags?.length && (
                    <ul className={styles.tagList}>
                        {localTags?.map((tag) => (
                            <li key={tag.id}>
                                <Link
                                    href={`/tags/${tag.id}`}
                                    title={''}
                                >
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
