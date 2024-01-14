import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { LatLng, LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import Dropdown from '@/ui/dropdown'
import Input from '@/ui/input'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import CategorySelector from '@/components/form-controllers/category-selector'
import ContentEditor from '@/components/form-controllers/content-editor'
import InputField from '@/components/form-controllers/input-field'
import TagsSelector from '@/components/form-controllers/tags-selector'

import { categoryImage } from '@/functions/categories'
import { round } from '@/functions/helpers'

import abandoned from '@/public/images/map-center.png'

interface LoginFormProps {}

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

const PlaceCreateForm: React.FC<LoginFormProps> = () => {
    const dispatch = useAppDispatch()
    const [formData, setFormState] = useState<ApiTypes.RequestAuthLogin>()

    const geolocation = useGeolocation()

    const [myCoordinates, setMyCoordinates] = useState<LatLngCoordinate>()
    const [mapBounds, setMapBounds] = useState<string>()
    const [mapCenter, setMapCenter] = useState<LatLng>()

    const [introduce] = API.useIntroduceMutation()
    const { data: poiListData } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    const { data: categoryData } = API.useCategoriesGetListQuery()

    // const { data: geocoderData, isLoading: geocoderLoading } =
    //     API.useLocationGetGeocoderQuery(
    //         {
    //             lat: mapCenter?.lat,
    //             lng: mapCenter?.lng
    //         },
    //         {
    //             skip: !mapCenter?.lat || !mapCenter?.lng
    //         }
    //     )

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds) => {
            setMapCenter(bounds.getCenter())
            setMapBounds(bounds.toBBoxString())
        }, 500),
        []
    )

    const [editorContent, setEditorContent] = React.useState<string>(' ')

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [name]: value }))
    }

    const categoryOptions = useMemo(
        () =>
            categoryData?.items?.map((item) => ({
                image: categoryImage(item.name),
                key: item.name,
                value: item.title
            })),
        [categoryData?.items]
    )

    useEffect(() => {
        const updateLatitude = round(geolocation?.latitude)
        const updateLongitude = round(geolocation?.longitude)

        if (
            updateLatitude &&
            updateLongitude &&
            updateLatitude !== myCoordinates?.latitude &&
            updateLongitude !== myCoordinates?.longitude
        ) {
            setMyCoordinates({
                latitude: updateLatitude,
                longitude: updateLongitude
            })

            introduce({ lat: updateLatitude, lon: updateLongitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <section>
            <Input
                label={'Заголовок интересного места'}
                placeholder={'Введите заголовок интересного места'}
                onChange={handleChange}
            />

            <Dropdown
                clearable={true}
                // value={selectedCategory}
                label={'Категория интересного места'}
                placeholder={'Выберите категорию'}
                options={categoryOptions}
                // onSelect={}
            />

            <Card sx={{ height: '260px', mb: 2, mt: 2, position: 'relative' }}>
                <Image
                    style={{
                        left: '48.1%',
                        position: 'absolute',
                        top: '43.8%',
                        zIndex: 10000
                    }}
                    src={abandoned}
                    alt={''}
                    width={32}
                    height={32}
                />
                <InteractiveMap
                    storeMapPosition={false}
                    places={poiListData?.items}
                    onChangeBounds={debounceSetMapBounds}
                    userLatLng={
                        geolocation.latitude && geolocation.longitude
                            ? {
                                  lat: geolocation.latitude,
                                  lng: geolocation.longitude
                              }
                            : undefined
                    }
                />
            </Card>

            <FormControl
                variant={'standard'}
                fullWidth={true}
            >
                <InputLabel
                    shrink={true}
                    htmlFor={'title'}
                    sx={{ fontSize: '16px' }}
                >
                    {'Адрес интересного места'}
                </InputLabel>
                <InputField
                    name={'address'}
                    id={'address'}
                    placeholder={'Адрес может быть определен автоматически'}
                    onChange={handleChange}
                />
            </FormControl>

            <Box sx={{ mt: 2 }}>
                <InputLabel
                    shrink={true}
                    htmlFor={'title'}
                    sx={{ fontSize: '16px' }}
                >
                    {'Описание интересного места'}
                </InputLabel>
                <ContentEditor
                    markdown={' '}
                    onChange={setEditorContent}
                />
            </Box>

            <TagsSelector onChangeTags={(tags) => console.log('tags', tags)} />

            <Box sx={{ mt: 2 }}>
                <Button
                    variant={'contained'}
                    color={'primary'}
                    onClick={handleLoginButton}
                >
                    {'Добавить'}
                </Button>
            </Box>
        </section>
    )
}
export default PlaceCreateForm
