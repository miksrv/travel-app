import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import debounce from 'lodash-es/debounce'
import { Button, Container, Select, SelectOptionType } from 'simple-react-ui-kit'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'

import { API } from '@/api'
import { openAuthDialog } from '@/app/applicationSlice'
import { Notify } from '@/app/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { ScreenSpinner } from '@/components/ui'
import { equalsArrays } from '@/utils/helpers'

import styles from './styles.module.sass'

const ContentEditor = dynamic(
    () => import('@/components/ui/content-editor/ContentEditor').then((m) => ({ default: m.ContentEditor })),
    { ssr: false }
)

interface PlaceDescriptionProps {
    placeId?: string
    content?: string
    tags?: string[]
    onEditorModeChange?: (isOpen: boolean) => void
}

export const PlaceDescription: React.FC<PlaceDescriptionProps> = ({ placeId, content, tags, onEditorModeChange }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [updatePlace, { data: saveData, isLoading, isSuccess }] = API.usePlacesPatchItemMutation()

    const [searchTags, { data: searchResult, isLoading: searchLoading }] = API.useTagsGetSearchMutation()

    const [editorMode, setEditorMode] = useState<boolean>(false)
    const [editorTags, setEditorTags] = useState<string[]>()
    const [localTags, setLocalTags] = useState<string[]>()
    const [localContent, setLocalContent] = useState<string | undefined>(content)
    const [tagSearch, setTagSearch] = useState('')

    const handleSetEditorClick = () => {
        if (isAuth) {
            const next = !editorMode
            setEditorMode(next)
            setEditorTags(localTags)
            onEditorModeChange?.(next)
        } else {
            dispatch(openAuthDialog())
        }
    }

    const handleSelectTags = (selected?: Array<SelectOptionType<string>>) => {
        setEditorTags(selected?.map((opt) => opt.key))
    }

    const debouncedSearchTags = useCallback(
        debounce(async (value: string) => {
            if (value.length > 0) {
                await searchTags(value)
            }
        }, 500),
        []
    )

    const handleSearchTags = (value?: string) => {
        const text = value ?? ''
        setTagSearch(text)
        void debouncedSearchTags(text)
    }

    const tagOptions = useMemo<Array<SelectOptionType<string>>>(() => {
        const selected = (editorTags ?? []).map((tag) => ({ key: tag, value: tag }))
        const results = (searchResult?.items ?? []).map((tag) => ({ key: tag, value: tag }))
        const merged = [...selected]
        for (const opt of results) {
            if (!merged.find((m) => m.key === opt.key)) {
                merged.push(opt)
            }
        }
        return merged
    }, [editorTags, searchResult?.items])

    const tagsWithCustom = useMemo<Array<SelectOptionType<string>>>(() => {
        if (!tagSearch || tagOptions.find((opt) => opt.key.toLowerCase() === tagSearch.toLowerCase())) {
            return tagOptions
        }
        return [{ key: tagSearch, value: tagSearch }, ...tagOptions]
    }, [tagOptions, tagSearch])

    const handleSaveEditorClick = async () => {
        await updatePlace({
            content: localContent,
            id: placeId!,
            tags: !equalsArrays(editorTags, localTags) ? editorTags : undefined
        })
    }

    useEffect(() => {
        if (isSuccess && editorMode) {
            setEditorMode(false)
            onEditorModeChange?.(false)
            setLocalContent(saveData.content)

            void dispatch(
                Notify({
                    id: 'placeFormSuccess',
                    message: t('geotag-saved'),
                    type: 'success'
                })
            )

            if (saveData.tags) {
                setLocalTags(saveData.tags)
            }
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
            title={t('description')}
            action={
                isAuth && editorMode ? (
                    <>
                        <Button
                            mode={'link'}
                            disabled={isLoading}
                            label={t('save')}
                            onClick={handleSaveEditorClick}
                        />
                        <Button
                            mode={'link'}
                            disabled={isLoading}
                            label={t('cancel')}
                            onClick={handleSetEditorClick}
                        />
                    </>
                ) : (
                    <Button
                        mode={'link'}
                        label={t('edit')}
                        onClick={handleSetEditorClick}
                    />
                )
            }
        >
            {isLoading && <ScreenSpinner />}

            {isAuth && editorMode ? (
                <ContentEditor
                    value={localContent}
                    onChange={setLocalContent}
                />
            ) : localContent ? (
                <div className={styles.content}>
                    <Markdown>{localContent}</Markdown>
                </div>
            ) : (
                <div className={styles.emptyContent}>{t('description-not-added-yet')}</div>
            )}

            {isAuth && editorMode ? (
                <div className={styles.formElement}>
                    <Select<string>
                        multiple
                        searchable
                        closeOnSelect={false}
                        label={t('select-or-add-geotag-hashtags')}
                        placeholder={t('input_tags-placeholder')}
                        notFoundCaption={t('nothing-found')}
                        value={editorTags}
                        loading={searchLoading}
                        options={tagsWithCustom}
                        onSearch={handleSearchTags}
                        onSelect={handleSelectTags}
                    />
                </div>
            ) : (
                !!localTags?.length && (
                    <ul className={styles.tagList}>
                        {localTags.map((tag, i) => (
                            <li key={`tag${i}`}>
                                <Link
                                    href={`/places?tag=${tag}`}
                                    title={`#${tag}`}
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
