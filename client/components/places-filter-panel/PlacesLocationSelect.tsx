import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { debounce } from '@mui/material/utils'
import React, { useMemo, useState } from 'react'

import { useAddressGetSearchMutation } from '@/api/api'
import { API } from '@/api/types'

interface PlacesLocationSelectProps {
    location?: API.PlaceLocationType
    onChangeLocation?: (value?: API.PlaceLocationType) => void
}

const PlacesLocationSelect: React.FC<PlacesLocationSelectProps> = (props) => {
    const { location, onChangeLocation } = props

    const [searchAddress, { data: searchResult, isLoading: searchLoading }] =
        useAddressGetSearchMutation()

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

    const AutocompleteData: API.PlaceLocationType[] = useMemo(
        () => [
            ...(searchResult?.countries?.map((item) => ({
                title: item.name,
                type: API.LocationType.Country,
                value: item.id
            })) || []),
            ...(searchResult?.regions?.map((item) => ({
                title: item.name,
                type: API.LocationType.Region,
                value: item.id
            })) || []),
            ...(searchResult?.districts?.map((item) => ({
                title: item.name,
                type: API.LocationType.District,
                value: item.id
            })) || []),
            ...(searchResult?.cities?.map((item) => ({
                title: item.name,
                type: API.LocationType.City,
                value: item.id
            })) || [])
        ],
        [searchResult]
    )

    return (
        <FormControl
            sx={{ m: 1 }}
            size='small'
        >
            <Autocomplete
                sx={{ width: 200 }}
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
                groupBy={(option) => option.type}
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
                        label={'Локация'}
                        variant={'outlined'}
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
