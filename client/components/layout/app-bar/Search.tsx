import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, cn } from 'simple-react-ui-kit'

import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { API, ApiType } from '@/api'
import { Autocomplete, AutocompleteOption } from '@/components/ui'

import styles from './styles.module.sass'

enum SuggestionType {
    PLACE = 'place',
    LOCATION = 'location',
    COORDINATES = 'coordinates'
}

export const Search: React.FC = () => {
    const { t } = useTranslation()
    const router = useRouter()

    const urlQuery = (router.query.q as string) ?? ''
    const [inputValue, setInputValue] = useState<string>(urlQuery)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setInputValue(urlQuery)
    }, [urlQuery])

    const isOnSearchPage = router.pathname === '/search'
    const inputMatchesUrl = inputValue.trim() === urlQuery.trim()
    const skipSuggestions = isOnSearchPage && inputMatchesUrl

    const { data: suggestData, isFetching } = API.useSearchSuggestQuery(inputValue, {
        skip: inputValue.length < 2 || skipSuggestions
    })

    const options = useMemo<Array<AutocompleteOption<ApiType.Search.Suggestion>>>(
        () =>
            suggestData?.suggestions?.map((suggestion) => {
                if (suggestion.type === SuggestionType.PLACE) {
                    return { title: suggestion.title, type: SuggestionType.PLACE, value: suggestion }
                }
                if (suggestion.type === SuggestionType.LOCATION) {
                    return { title: suggestion.title, type: SuggestionType.LOCATION, value: suggestion }
                }
                return {
                    title: `${suggestion.lat}, ${suggestion.lon}`,
                    type: SuggestionType.COORDINATES,
                    value: suggestion
                }
            }) ?? [],
        [suggestData?.suggestions]
    )

    const handleOpen = () => {
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false)
        setInputValue(urlQuery)
    }

    const handleSearch = (value: string) => {
        setInputValue(value)
    }

    const navigateToSearch = async (q: string) => {
        const trimmed = q.trim()
        if (trimmed) {
            await router.push(`/search?q=${encodeURIComponent(trimmed)}`)
        }
    }

    const handleSelect = async (option?: AutocompleteOption<ApiType.Search.Suggestion>) => {
        if (!option) {
            return
        }

        const suggestion = option.value

        if (suggestion.type === SuggestionType.PLACE) {
            await router.push(`/places/${suggestion.id}`)
            handleClose()
            return
        }

        const zoom = suggestion.type === SuggestionType.COORDINATES ? 14 : 12
        const hash = `${suggestion.lat},${suggestion.lon},${zoom}?m=${suggestion.lat},${suggestion.lon}`

        if (router.pathname === '/map') {
            await router.replace({ hash, pathname: '/map' })
        } else {
            await router.push(`/map#${hash}`)
        }

        handleClose()
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                handleClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleMouseDown)
        }
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [isOpen])

    // Close search when route changes
    useEffect(() => {
        handleClose()
    }, [router.pathname])

    return (
        <>
            <Button
                mode={'outline'}
                icon={'Search'}
                size={'medium'}
                aria-label={t('global-search-placeholder', { defaultValue: 'Поиск мест, координат' })}
                onClick={handleOpen}
            />

            <div className={cn(styles.searchOverlay, isOpen && styles.searchOverlayOpen)}>
                <div
                    ref={overlayRef}
                    className={styles.searchOverlayInner}
                >
                    {isOpen && (
                        <>
                            <Autocomplete<ApiType.Search.Suggestion>
                                className={styles.searchInput}
                                notFoundCaption={t('nothing-found', { defaultValue: 'Ничего не найдено' })}
                                placeholder={t('global-search-placeholder', { defaultValue: 'Поиск мест, координат' })}
                                debounceDelay={300}
                                leftIcon={'Search'}
                                hideArrow={!options.length || !inputValue.length}
                                loading={isFetching}
                                inputValue={inputValue}
                                options={options}
                                onSearch={handleSearch}
                                onSelect={handleSelect}
                                suppressDropdown={skipSuggestions}
                                onEnterPress={(value) => void navigateToSearch(value)}
                                autoFocus
                            />

                            <Button
                                mode={'outline'}
                                icon={'Close'}
                                size={'medium'}
                                aria-label={'Закрыть поиск'}
                                onClick={handleClose}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
