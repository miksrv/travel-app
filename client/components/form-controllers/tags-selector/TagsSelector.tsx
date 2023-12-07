import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material/utils'
import React, { useMemo, useState } from 'react'

import { API } from '@/api/api'

interface TagsSelectorProps {
    tags?: string[]
    onChangeTags?: (value?: string[]) => void
}

const TagsSelector: React.FC<TagsSelectorProps> = ({ tags, onChangeTags }) => {
    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const [tagsLoading, setTagsLoading] = useState<boolean>(false)

    const onSearchChange = useMemo(
        () =>
            debounce((search: string) => {
                if (search.length >= 2) {
                    searchTags(search)
                }
                setTagsLoading(false)
            }, 300),
        []
    )

    return (
        <Autocomplete
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    padding: '0'
                },
                '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                    border: '0.5px solid #cbcccd'
                },
                background: '#f7f8fa'
            }}
            noOptionsText={'Нет найденных локаций'}
            multiple={true}
            freeSolo={true}
            autoComplete={true}
            includeInputInList={true}
            filterSelectedOptions={true}
            filterOptions={(option) => option}
            getOptionLabel={(option) => option}
            value={tags}
            loading={searchLoading}
            options={searchResult?.items || []}
            onChange={(event, newValue) => {
                onChangeTags?.((newValue as string[]) || [])
            }}
            onInputChange={(event, newInputValue) => {
                if (!tags?.includes(newInputValue)) {
                    setTagsLoading(true)
                }

                onSearchChange(newInputValue)
            }}
            renderOption={(props, option) => (
                <li {...props}>
                    <Typography variant={'body1'}>{option}</Typography>
                </li>
            )}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    placeholder={'Введите до 20 тегов'}
                    variant={'outlined'}
                    size={'small'}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {searchLoading || tagsLoading ? (
                                    <CircularProgress
                                        color='inherit'
                                        size={16}
                                    />
                                ) : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        )
                    }}
                />
            )}
        />
    )
}

export default TagsSelector
