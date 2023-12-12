import {
    Autocomplete,
    CircularProgress,
    FormControl,
    TextField,
    Typography
} from '@mui/material'
import Image from 'next/image'
import React from 'react'

import { API } from '@/api/api'
import { Place } from '@/api/types'

import { categoryImage } from '@/functions/categories'

interface CategorySelectorProps {
    category?: Place.Category
    onChangeCategory?: (value?: Place.Category) => void
}

const CategorySelector: React.FC<CategorySelectorProps> = (props) => {
    const { category, onChangeCategory } = props

    const { data, isLoading } = API.useCategoriesGetListQuery()

    return (
        <FormControl
            fullWidth={true}
            sx={{ mt: 2 }}
            size={'small'}
        >
            <Autocomplete
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        padding: '0'
                    },
                    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline':
                        {
                            border: '0.5px solid #cbcccd'
                        },
                    background: '#f7f8fa'
                }}
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.title
                }
                loading={isLoading}
                options={data?.items || []}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={category}
                noOptionsText={'Нет категорий'}
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
                        // label={'Категория'}
                        placeholder={'Выберите категорию'}
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

export default CategorySelector
