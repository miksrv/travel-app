import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import React from 'react'

import { API } from '@/api/api'
import { Place } from '@/api/types'

import { categoryImage } from '@/functions/categories'

interface PlacesCategorySelectProps {
    category?: Place.Category
    onChangeCategory?: (value?: Place.Category) => void
}

const PlacesCategorySelect: React.FC<PlacesCategorySelectProps> = (props) => {
    const { category, onChangeCategory } = props

    const { data, isLoading } = API.useCategoriesGetListQuery()

    return (
        <FormControl
            sx={{ m: 1, minWidth: 220, width: 'auto' }}
            size='small'
        >
            <Autocomplete
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.title
                }
                loading={isLoading}
                options={data?.items || []}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={category}
                noOptionsText='Нет категорий'
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
                            src={categoryImage(option.name).src}
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
                        placeholder={'Категория'}
                        variant={'outlined'}
                        size={'small'}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {isLoading ? (
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
                                    src={categoryImage(category.name).src}
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
