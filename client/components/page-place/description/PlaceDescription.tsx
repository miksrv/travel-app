import { useTranslation } from 'next-i18next'
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

import styles from './styles.module.sass'

interface PlaceDescriptionProps {
    placeId?: string
    content?: string
    tags?: string[]
}

const PlaceDescription: React.FC<PlaceDescriptionProps> = ({
    placeId,
    content,
    tags
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.placeDescription'
    })

    const dispatch = useAppDispatch()
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [updatePlace, { data: saveData, isLoading, isSuccess }] =
        API.usePlacesPatchItemMutation()

    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const [editorMode, setEditorMode] = useState<boolean>(false)
    const [editorContent, setEditorContent] = useState<string>()
    const [editorTags, setEditorTags] = useState<string[]>()

    const [localTags, setLocalTags] = useState<string[]>()
    const [localContent, setLocalContent] = useState<string>()

    const handleSetEditorClick = () => {
        if (isAuth) {
            setEditorMode(!editorMode)
            setEditorTags(localTags)
        } else {
            dispatch(openAuthDialog())
        }
    }

    const handleSelectTags = (value: string[]) => {
        setEditorTags(value)
    }

    const handleSearchTags = (value: string) => {
        if (value?.length > 0) {
            searchTags(value)
        }
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
    }, [content, tags])

    useEffect(() => {
        setEditorMode(false)
    }, [placeId])

    return (
        <Container
            className={styles.placeDescription}
            title={t('title')}
            action={
                isAuth && editorMode ? (
                    <>
                        <Button
                            mode={'secondary'}
                            disabled={isLoading}
                            onClick={handleSaveEditorClick}
                        >
                            {t('buttonSave')}
                        </Button>
                        <Button
                            mode={'secondary'}
                            disabled={isLoading}
                            onClick={handleSetEditorClick}
                        >
                            {t('buttonCancel')}
                        </Button>
                    </>
                ) : (
                    <Button
                        icon={'Pencil'}
                        onClick={handleSetEditorClick}
                    >
                        {t('buttonEdit')}
                    </Button>
                )
            }
        >
            {isLoading && <ScreenSpinner />}

            {isAuth && editorMode ? (
                <ContentEditor
                    markdown={localContent ?? content ?? ''}
                    onChange={setEditorContent}
                />
            ) : content || localContent ? (
                <div className={styles.content}>
                    <Markdown>{localContent ?? content}</Markdown>
                </div>
            ) : (
                <div className={styles.emptyContent}>{t('emptyContent')}</div>
            )}

            {isAuth && editorMode ? (
                <div className={styles.formElement}>
                    <ChipsSelect
                        label={t('tagSelectLabel')}
                        placeholder={''}
                        value={editorTags}
                        loading={searchLoading}
                        options={searchResult?.items}
                        onSearch={handleSearchTags}
                        onSelect={handleSelectTags}
                    />
                </div>
            ) : (
                !!localTags?.length && (
                    <ul className={styles.tagList}>
                        {localTags?.map((tag, i) => (
                            <li key={`tag${i}`}>
                                <Link
                                    href={`/places?tag=${tag}`}
                                    title={''}
                                >
                                    {`#${tag}`}
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
