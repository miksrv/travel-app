import { Pagination } from '@mui/material'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React, { useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { useIntroduceMutation, usePlacesGetListQuery } from '@/api/api'
import { API } from '@/api/types'

import PageLayout from '@/components/page-layout'
import PlacesList from '@/components/places-list'

const POST_PER_PAGE = 8

type SortOptionsProps = {
    key: API.SortFields
    value: string
}

const SortOptions: SortOptionsProps[] = [
    {
        key: API.SortFields.Views,
        value: 'Количеству просмотров'
    },
    {
        key: API.SortFields.Rating,
        value: 'Рейтингу'
    },
    {
        key: API.SortFields.Created,
        value: 'Дате добавления'
    },
    {
        key: API.SortFields.Updated,
        value: 'Дате обновления'
    },
    {
        key: API.SortFields.Title,
        value: 'Алфавиту'
    },
    {
        key: API.SortFields.Distance,
        value: 'Расстоянию'
    }
]

const Places: NextPage = () => {
    const searchParams = useSearchParams()
    const geolocation = useGeolocation()
    const router = useRouter()

    const [sort, setSort] = useState<API.SortFields>(API.SortFields.Created)
    const [order, setOrder] = useState<API.SortOrder>(API.SortOrder.DESC)

    const page = searchParams.get('page')

    const [introduce] = useIntroduceMutation()
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
        setOrder(event.target.value as API.SortOrder)
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
        <PageLayout maxWidth={'lg'}>
            <br />
            <Breadcrumbs aria-label='breadcrumb'>
                <Link
                    color='inherit'
                    href='/'
                >
                    MUI
                </Link>
                <Link
                    color='inherit'
                    href='/material-ui/getting-started/installation/'
                >
                    Core
                </Link>
                <Typography color='text.primary'>Breadcrumbs</Typography>
            </Breadcrumbs>

            <Paper sx={{ mb: 2, mt: 2 }}>
                <FormControl
                    sx={{ m: 1, minWidth: 220 }}
                    size='small'
                >
                    <InputLabel id='demo-select-small-label'>
                        Сортировка
                    </InputLabel>
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
                    <InputLabel>Порядок</InputLabel>
                    <Select
                        value={order}
                        label='Порядок'
                        onChange={handleChangeOrder}
                    >
                        <MenuItem value={API.SortOrder.ASC}>
                            По возрастанию
                        </MenuItem>
                        <MenuItem value={API.SortOrder.DESC}>
                            По убыванию
                        </MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <PlacesList places={data?.items} />

            {data?.count && (
                <Pagination
                    sx={{ mt: 2 }}
                    count={Math.ceil(data?.count / POST_PER_PAGE)}
                    shape='rounded'
                    onChange={handlePaginationChange}
                />
            )}
        </PageLayout>
    )
}

export default Places
