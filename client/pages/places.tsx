import { useIntroduceMutation, usePlacesGetListQuery } from '@/api/api'
import { API } from '@/api/types'
import { Pagination } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React from 'react'
import useGeolocation from 'react-hook-geolocation'

import PlacesList from '@/components/places-list'

const POST_PER_PAGE = 8

type SortOptionsProps = {
    key: API.SortFields
    value: string
}

const SortOptions: SortOptionsProps[] = [
    {
        key: 'views',
        value: 'Просмотры'
    },
    {
        key: 'rating',
        value: 'Рейтинг'
    },
    {
        key: 'created_at',
        value: 'Создано'
    },
    {
        key: 'updated_at',
        value: 'Обновлено'
    },
    {
        key: 'title',
        value: 'Заголовок'
    },
    {
        key: 'distance',
        value: 'Расстояние'
    }
]

const Places: NextPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const page = searchParams.get('page')
    const geolocation = useGeolocation()
    const [introduce] = useIntroduceMutation()
    const [sort, setSort] = React.useState<API.SortFields>()
    const [order, setOrder] = React.useState<API.Order>()

    const { data, isLoading } = usePlacesGetListQuery({
        limit: POST_PER_PAGE,
        offset: ((Number(page) || 1) - 1) * POST_PER_PAGE,
        order: order,
        sort: sort
    })

    const handleChangeSort = (event: SelectChangeEvent) => {
        setSort(event.target.value as API.SortFields)
    }

    const handleChangeOrder = (event: SelectChangeEvent) => {
        setOrder(event.target.value as API.Order)
    }

    const handlePaginationChange = async (
        e: React.ChangeEvent<unknown>,
        value: number
    ) => {
        await router.push(
            value === 1 ? 'places' : `places?page=${value}`,
            undefined,
            {
                shallow: true
            }
        )
    }

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <div className={'wrapper'}>
            <FormControl
                sx={{ m: 1, minWidth: 220 }}
                size='small'
            >
                <InputLabel id='demo-select-small-label'>Сортировка</InputLabel>
                <Select
                    labelId='demo-select-small-label'
                    value={sort}
                    label='Сортировка'
                    onChange={handleChangeSort}
                >
                    {SortOptions.map((option) => (
                        <MenuItem
                            value={option.key}
                            key={option.key}
                        >
                            {option.value}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl
                sx={{ m: 1, minWidth: 220 }}
                size='small'
            >
                <InputLabel id='demo-select-small-label'>Порядок</InputLabel>
                <Select
                    labelId='demo-select-small-label'
                    value={sort}
                    label='Порядок'
                    onChange={handleChangeOrder}
                >
                    <MenuItem value='ASC'>По возрастанию</MenuItem>
                    <MenuItem value='DESC'>По убыванию</MenuItem>
                </Select>
            </FormControl>

            <PlacesList places={data?.items} />
            <br />
            {data?.count && (
                <Pagination
                    count={Math.ceil(data?.count / POST_PER_PAGE)}
                    shape='rounded'
                    onChange={handlePaginationChange}
                />
            )}
        </div>
    )
}

export default Places
