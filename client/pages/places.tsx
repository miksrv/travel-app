import { Pagination } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import { debounce } from '@mui/material/utils'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React, { useMemo, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import {
    useAddressGetSearchMutation,
    useIntroduceMutation,
    usePlacesGetListQuery
} from '@/api/api'
import { API } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PageTitle from '@/components/page-title'
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

    const [searchAddress, { data: searchResult, isLoading: searchLoading }] =
        useAddressGetSearchMutation()

    const [searchValue, setSearchValue] = React.useState<string>('')

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

    const onSearchChange = useMemo(
        () =>
            debounce((search: string) => {
                if (search.length > 3) {
                    searchAddress(search)
                }
                // setSearchValue(search)
            }, 1000),
        []
    )
    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    // useEffect(() => {
    //
    // }, [searchValue])

    const AutocompleteData = useMemo(() => {
        const result = [
            ...(searchResult?.cities?.map((item) => ({
                title: item.name,
                type: 'city',
                value: item.id
            })) || []),
            ...(searchResult?.countries?.map((item) => ({
                title: item.name,
                type: 'country',
                value: item.id
            })) || []),
            ...(searchResult?.districts?.map((item) => ({
                title: item.name,
                type: 'district',
                value: item.id
            })) || []),
            ...(searchResult?.regions?.map((item) => ({
                title: item.name,
                type: 'region',
                value: item.id
            })) || [])
        ]

        return result
    }, [searchResult])

    return (
        <PageLayout maxWidth={'lg'}>
            <PageTitle title={'Интересные места'} />
            <Breadcrumbs currentPage={'Интересные места'} />
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

                <FormControl
                    sx={{ m: 1 }}
                    size='small'
                >
                    <Autocomplete
                        sx={{ width: 300 }}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.title
                        }
                        loading={searchLoading}
                        filterOptions={(x) => x}
                        options={AutocompleteData}
                        autoComplete
                        includeInputInList
                        filterSelectedOptions
                        // value={value}
                        noOptionsText='Нет найденных локаций'
                        groupBy={(option) => option.type}
                        onChange={(event: any, newValue: any) => {
                            console.log('newValue', newValue)
                        }}
                        onInputChange={(event, newInputValue) => {
                            onSearchChange(newInputValue)
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    {option.title}
                                </Typography>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label='Локация'
                                variant='outlined'
                                size='small'
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {searchLoading ? (
                                                <CircularProgress
                                                    color='inherit'
                                                    size={20}
                                                />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    )
                                }}
                            />
                        )}
                    />
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
