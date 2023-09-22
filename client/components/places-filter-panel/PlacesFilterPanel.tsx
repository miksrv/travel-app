import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import React from 'react'

import { API } from '@/api/types'

import PlacesLocationSelect from '@/components/places-filter-panel/PlacesLocationSelect'

interface PlacesFilterPanelProps {
    sort?: API.SortFields
    order?: API.SortOrder
    location?: API.PlaceLocationType
    onChangeSort?: (value: API.SortFields) => void
    onChangeOrder?: (value: API.SortOrder) => void
    onChangeLocation?: (value?: API.PlaceLocationType) => void
}

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

const PlacesFilterPanel: React.FC<PlacesFilterPanelProps> = (props) => {
    const {
        sort,
        order,
        location,
        onChangeSort,
        onChangeOrder,
        onChangeLocation
    } = props

    return (
        <Paper sx={{ mb: 2, mt: 2 }}>
            <FormControl
                sx={{ m: 1, minWidth: 220 }}
                size={'small'}
            >
                <InputLabel>Сортировка</InputLabel>
                <Select
                    value={sort}
                    label={'Сортировка'}
                    onChange={(event: SelectChangeEvent) =>
                        onChangeSort?.(event.target.value as API.SortFields)
                    }
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
                size={'small'}
            >
                <InputLabel>Порядок</InputLabel>
                <Select
                    value={order}
                    label={'Порядок'}
                    onChange={(event: SelectChangeEvent) => {
                        onChangeOrder?.(event.target.value as API.SortOrder)
                    }}
                >
                    <MenuItem value={API.SortOrder.ASC}>
                        {'По возрастанию'}
                    </MenuItem>
                    <MenuItem value={API.SortOrder.DESC}>
                        {'По убыванию'}
                    </MenuItem>
                </Select>
            </FormControl>

            <PlacesLocationSelect
                location={location}
                onChangeLocation={onChangeLocation}
            />
        </Paper>
    )
}

export default PlacesFilterPanel
