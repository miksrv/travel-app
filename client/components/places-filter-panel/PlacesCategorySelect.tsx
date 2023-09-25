import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material/utils'
import Image from 'next/image'
import React, { useMemo, useState } from 'react'

import { useCategoriesGetListQuery } from '@/api/api'
import { API, Place } from '@/api/types'

interface PlacesCategorySelectProps {
    category?: Place.Category
    onChangeCategory?: (value?: Place.Category) => void
}

const PlacesCategorySelect: React.FC<PlacesCategorySelectProps> = (props) => {
    const { category, onChangeCategory } = props

    const { data, isLoading } = useCategoriesGetListQuery()

    const [locationLoading, setLocationLoading] = useState<boolean>(false)

    return (
        <FormControl
            sx={{ m: 1 }}
            size='small'
        >
            <Autocomplete
                sx={{ minWidth: 200 }}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.title
                }
                loading={isLoading}
                filterOptions={(x) => x}
                options={data?.items || []}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={category}
                noOptionsText='Нет найденных локаций'
                onChange={(event, newValue) => {
                    onChangeCategory?.(newValue || undefined)
                }}
                renderOption={(props, option) => (
                    <li {...props}>
                        <Image
                            style={{
                                height: '16px',
                                marginRight: '8px',
                                objectFit: 'cover',
                                width: '15px'
                            }}
                            src={`/poi/${option?.name}.png`}
                            alt={option?.title}
                            width={22}
                            height={26}
                        />
                        <Typography variant='body1'>{option.title}</Typography>
                    </li>
                )}
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        label={'Категория'}
                        variant={'outlined'}
                        size={'small'}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {locationLoading ? (
                                        <CircularProgress
                                            color='inherit'
                                            size={16}
                                        />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                            startAdornment: category ? (
                                <Image
                                    style={{
                                        height: '16px',
                                        lineHeight: '10px',
                                        marginRight: '-3px',
                                        marginTop: '2px',
                                        objectFit: 'cover',
                                        width: '15px'
                                    }}
                                    src={`/poi/${category?.name}.png`}
                                    alt={category?.title}
                                    width={22}
                                    height={26}
                                />
                            ) : undefined
                        }}
                    />
                )}
            />
        </FormControl>
    )
}

export default PlacesCategorySelect
