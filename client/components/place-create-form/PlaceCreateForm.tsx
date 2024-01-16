import { LatLng, LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import ChipsSelect from '@/ui/chips-select'
import ContentEditor from '@/ui/content-editor'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import Input from '@/ui/input'

import { API } from '@/api/api'

import TagsSelector from '@/components/form-controllers/tags-selector'

import { categoryImage } from '@/functions/categories'
import { round } from '@/functions/helpers'

import styles from './styles.module.sass'

interface LoginFormProps {}

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

export type PlaceFormData = {
    title?: string
    content?: string
    category?: string | number
    tags?: string[]
}

export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

const PlaceCreateForm: React.FC<LoginFormProps> = () => {
    const [formData, setFormState] = useState<PlaceFormData>()

    const geolocation = useGeolocation()

    const [myCoordinates, setMyCoordinates] = useState<LatLngCoordinate>()
    const [mapBounds, setMapBounds] = useState<string>()
    const [mapCenter, setMapCenter] = useState<LatLng>()

    const [introduce] = API.useIntroduceMutation()
    const { data: poiListData } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const { data: categoryData } = API.useCategoriesGetListQuery()

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

    const handleChangeCategory = (category?: DropdownOption) => {
        setFormState({ ...formData, category: category?.key })
    }

    const handleSelectTags = (value: string[]) => {
        setFormState({ ...formData, tags: value })
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

    const selectedCategory = categoryOptions?.find(
        ({ key }) => key === formData?.category
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
        <section className={styles.component}>
            <div className={styles.formElement}>
                <Input
                    label={'Заголовок интересного места'}
                    placeholder={'Введите заголовок интересного места'}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Dropdown
                    clearable={true}
                    value={selectedCategory}
                    label={'Категория интересного места'}
                    placeholder={'Выберите категорию'}
                    options={categoryOptions}
                    onSelect={handleChangeCategory}
                />
            </div>

            <div className={styles.mapContainer}>
                {selectedCategory && (
                    <Image
                        className={styles.categoryImage}
                        src={categoryImage(selectedCategory.key)?.src}
                        alt={''}
                        width={22}
                        height={25}
                    />
                )}
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
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Адрес'}
                    placeholder={
                        'Адрес интересного места будет определен автоматически'
                    }
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <label>{'Описание'}</label>
                <ContentEditor
                    markdown={' '}
                    onChange={setEditorContent}
                />
            </div>

            <div className={styles.formElement}>
                <TagsSelector
                    onChangeTags={(tags) => console.log('tags', tags)}
                />
            </div>

            <div className={styles.formElement}>
                <ChipsSelect
                    label={'Выберите или добавьте метки интересного места'}
                    placeholder={''}
                    value={formData?.tags}
                    loading={searchLoading}
                    options={searchResult?.items}
                    onSearch={(value) => searchTags(value)}
                    onSelect={handleSelectTags}
                />
            </div>
        </section>
    )
}
export default PlaceCreateForm
