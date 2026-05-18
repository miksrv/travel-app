import React, { useEffect, useMemo, useState } from 'react'

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

type SearchProps = React.InputHTMLAttributes<HTMLInputElement>

export const Search: React.FC<SearchProps> = () => {
    const { t } = useTranslation()
    const router = useRouter()

    const urlQuery = (router.query.q as string) ?? ''
    const [inputValue, setInputValue] = useState<string>(urlQuery)

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
                    return {
                        title: suggestion.title,
                        type: SuggestionType.PLACE,
                        value: suggestion
                    }
                }

                if (suggestion.type === SuggestionType.LOCATION) {
                    return {
                        title: suggestion.title,
                        type: SuggestionType.LOCATION,
                        value: suggestion
                    }
                }

                return {
                    title: `${suggestion.lat}, ${suggestion.lon}`,
                    type: SuggestionType.COORDINATES,
                    value: suggestion
                }
            }) ?? [],
        [suggestData?.suggestions]
    )

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
            return
        }

        const zoom = suggestion.type === SuggestionType.COORDINATES ? 14 : 12
        const hash = `${suggestion.lat},${suggestion.lon},${zoom}?m=${suggestion.lat},${suggestion.lon}`

        if (router.pathname === '/map') {
            await router.replace({ hash, pathname: '/map' })
        } else {
            await router.push(`/map#${hash}`)
        }
    }

    return (
        <div
            className={styles.searchWrapper}
            role={'search'}
        >
            <Autocomplete<ApiType.Search.Suggestion>
                className={styles.search}
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
            />
        </div>
    )
}
