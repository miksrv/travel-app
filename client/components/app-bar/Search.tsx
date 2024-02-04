import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'

import Autocomplete from '@/ui/autocomplete'
import { DropdownOption } from '@/ui/dropdown'

import { API } from '@/api/api'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Search: React.FC<SearchProps> = () => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.appBar.search'
    })
    const router = useRouter()

    const [searchString, setSearchString] = useState<string>('')
    const { data, isFetching } = API.usePlacesGetListQuery(
        {
            limit: 10,
            search: searchString
        },
        { skip: searchString?.length <= 2 }
    )

    const options = useMemo(
        () =>
            data?.items?.map((item) => {
                let address: string[] = []

                if (item.address?.country) {
                    address.push(item.address.country.title)
                }

                if (item.address?.region) {
                    address.push(item.address.region.title)
                }

                if (item.address?.district) {
                    address.push(item.address.district.title)
                }

                if (item.address?.locality) {
                    address.push(item.address.locality.title)
                }

                return {
                    description: address.join(', '),
                    image: categoryImage(item.category?.name),
                    key: item.id,
                    value: item.title
                }
            }),
        [data?.items]
    )

    const handleSearchLocation = (value: string) => {
        setSearchString(value)
    }

    const handleSelectLocation = async (value: DropdownOption) => {
        await router.push(`/places/${value.key}`)
    }

    return (
        <Autocomplete
            className={styles.search}
            placeholder={t('placeholder')}
            leftIcon={'Search'}
            hideArrow={!options?.length || !searchString?.length}
            loading={isFetching}
            options={options}
            onSearch={handleSearchLocation}
            onSelect={handleSelectLocation}
        />
    )
}

export default Search
