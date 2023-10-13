import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material/utils'
import React, { useMemo, useState } from 'react'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'

interface PlacesLocationSelectProps {
    location?: ApiTypes.PlaceLocationType
    onChangeLocation?: (value?: ApiTypes.PlaceLocationType) => void
}

const PlacesLocationSelect: React.FC<PlacesLocationSelectProps> = (props) => {
    const { location, onChangeLocation } = props

    const [searchAddress, { data: searchResult, isLoading: searchLoading }] =
        API.useAddressGetSearchMutation()

    const [locationLoading, setLocationLoading] = useState<boolean>(false)

    const onSearchChange = useMemo(
        () =>
            debounce((search: string) => {
                if (search.length > 3) {
                    searchAddress(search)
                }
                setLocationLoading(false)
            }, 1000),
        []
    )

    const AutocompleteData: ApiTypes.PlaceLocationType[] = useMemo(
        () => [
            ...(searchResult?.countries?.map((item) => ({
                title: item.name,
                type: ApiTypes.LocationType.Country,
                value: item.id
            })) || []),
            ...(searchResult?.regions?.map((item) => ({
                title: item.name,
                type: ApiTypes.LocationType.Region,
                value: item.id
            })) || []),
            ...(searchResult?.districts?.map((item) => ({
                title: item.name,
                type: ApiTypes.LocationType.District,
                value: item.id
            })) || []),
            ...(searchResult?.cities?.map((item) => ({
                title: item.name,
                type: ApiTypes.LocationType.City,
                value: item.id
            })) || [])
        ],
        [searchResult]
    )

    return (
        <FormControl
            sx={{ m: 1, minWidth: 200, width: '100%' }}
            size='small'
        >
            <Autocomplete
                getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.title
                }
                loading={searchLoading}
                filterOptions={(x) => x}
                options={AutocompleteData}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={location}
                noOptionsText='Нет найденных локаций'
                // groupBy={(option) => option.type}
                onChange={(event, newValue) => {
                    onChangeLocation?.(newValue || undefined)
                }}
                onInputChange={(event, newInputValue) => {
                    if (newInputValue !== location?.title) {
                        setLocationLoading(true)
                    }

                    onSearchChange(newInputValue)
                }}
                renderOption={(props, option) => (
                    <li {...props}>
                        <Typography variant='body1'>{option.title}</Typography>
                    </li>
                )}
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        variant={'outlined'}
                        placeholder={'Поиск по локации'}
                        size={'small'}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {searchLoading || locationLoading ? (
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
        </FormControl>
    )
}

export default PlacesLocationSelect
