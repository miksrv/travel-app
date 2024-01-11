import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import React from 'react'

import Container from '@/ui/container'
import Dropdown from '@/ui/dropdown'

import { ApiTypes, Place } from '@/api/types'

import PlacesCategorySelect from '@/components/places-filter-panel/PlacesCategorySelect'
import PlacesLocationSelect from '@/components/places-filter-panel/PlacesLocationSelect'

import styles from './styles.module.sass'

interface PlacesFilterPanelProps {
    sort?: ApiTypes.SortFields
    order?: ApiTypes.SortOrder
    location?: ApiTypes.PlaceLocationType
    category?: Place.Category
    onChangeSort?: (value: ApiTypes.SortFields) => void
    onChangeOrder?: (value: ApiTypes.SortOrder) => void
    onChangeLocation?: (value?: ApiTypes.PlaceLocationType) => void
    onChangeCategory?: (value?: Place.Category) => void
}

type SortOptionsProps = {
    key: ApiTypes.SortFields
    value: string
}

const SortOptions: SortOptionsProps[] = [
    {
        key: ApiTypes.SortFields.Views,
        value: 'Просмотры'
    },
    {
        key: ApiTypes.SortFields.Rating,
        value: 'Рейтинг'
    },
    {
        key: ApiTypes.SortFields.Created,
        value: 'Дата добавления'
    },
    {
        key: ApiTypes.SortFields.Updated,
        value: 'Дата обновления'
    },
    {
        key: ApiTypes.SortFields.Title,
        value: 'Заголовок'
    },
    {
        key: ApiTypes.SortFields.Distance,
        value: 'Расстояние'
    }
]

const PlacesFilterPanel: React.FC<PlacesFilterPanelProps> = (props) => {
    const {
        sort,
        order,
        location,
        category,
        onChangeSort,
        onChangeOrder,
        onChangeLocation,
        onChangeCategory
    } = props

    return (
        <Container className={styles.component}>
            <div className={styles.container}>
                <Dropdown
                    value={sort}
                    className={styles.sortDropdown}
                    options={SortOptions.map((item) => item)}
                    onSelect={onChangeSort}
                />

                <Dropdown
                    value={order}
                    className={styles.orderDropdown}
                    options={[
                        {
                            key: ApiTypes.SortOrder.ASC,
                            value: 'По возрастанию'
                        },
                        {
                            key: ApiTypes.SortOrder.DESC,
                            value: 'По убыванию'
                        }
                    ]}
                    onSelect={onChangeOrder}
                />
                {/*<Stack*/}
                {/*    direction={'row'}*/}
                {/*    justifyContent={'space-between'}*/}
                {/*    spacing={1}*/}
                {/*    sx={{ mb: 1, mt: 2 }}*/}
                {/*>*/}
                {/*    <FormControl*/}
                {/*        sx={{ m: 1, minWidth: 210, width: 'auto' }}*/}
                {/*        size={'small'}*/}
                {/*    >*/}
                {/*        <InputLabel>Сортировка</InputLabel>*/}
                {/*        <Select*/}
                {/*            value={sort}*/}
                {/*            variant={'outlined'}*/}
                {/*            label={'Сортировка'}*/}
                {/*            onChange={(event: SelectChangeEvent) =>*/}
                {/*                onChangeSort?.(*/}
                {/*                    event.target.value as ApiTypes.SortFields*/}
                {/*                )*/}
                {/*            }*/}
                {/*        >*/}
                {/*            {SortOptions.map((option) => (*/}
                {/*                <MenuItem*/}
                {/*                    value={option.key}*/}
                {/*                    key={option.key}*/}
                {/*                >*/}
                {/*                    {option.value}*/}
                {/*                </MenuItem>*/}
                {/*            ))}*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}

                {/*    <FormControl*/}
                {/*        sx={{ m: 1, minWidth: 150, width: 'auto' }}*/}
                {/*        size={'small'}*/}
                {/*    >*/}
                {/*        <InputLabel>Порядок</InputLabel>*/}
                {/*        <Select*/}
                {/*            value={order}*/}
                {/*            label={'Порядок'}*/}
                {/*            onChange={(event: SelectChangeEvent) => {*/}
                {/*                onChangeOrder?.(*/}
                {/*                    event.target.value as ApiTypes.SortOrder*/}
                {/*                )*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            <MenuItem value={ApiTypes.SortOrder.ASC}>*/}
                {/*                {'По возрастанию'}*/}
                {/*            </MenuItem>*/}
                {/*            <MenuItem value={ApiTypes.SortOrder.DESC}>*/}
                {/*                {'По убыванию'}*/}
                {/*            </MenuItem>*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}

                {/*    <PlacesCategorySelect*/}
                {/*        category={category}*/}
                {/*        onChangeCategory={onChangeCategory}*/}
                {/*    />*/}

                {/*    <PlacesLocationSelect*/}
                {/*        location={location}*/}
                {/*        onChangeLocation={onChangeLocation}*/}
                {/*    />*/}
                {/*</Stack>*/}
            </div>
        </Container>
    )
}

export default PlacesFilterPanel
