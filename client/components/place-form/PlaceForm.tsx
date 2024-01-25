import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@/ui/button'
import ChipsSelect from '@/ui/chips-select'
import ContentEditor from '@/ui/content-editor'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import Input from '@/ui/input'
import Message from '@/ui/message'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

interface PlaceFormProps {
    placeId?: string
    values?: PlaceFormState
}

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

export type PlaceFormErrors = {
    title?: string
    category?: string
}

export type PlaceFormState = {
    title?: string
    content?: string
    category?: string
    tags?: string[]
    coordinates?: ApiTypes.LatLonCoordinate
}

const PlaceForm: React.FC<PlaceFormProps> = ({ placeId, values }) => {
    const router = useRouter()

    const location = useAppSelector((state) => state.application.userLocation)
    const [formData, setFormData] = useState<PlaceFormState>()
    const [formErrors, setFormErrors] = useState<PlaceFormErrors>()
    const [mapBounds, setMapBounds] = useState<string>()

    const { data: poiListData } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const [createPlace, { data: createPlaceData, isLoading: createLoading }] =
        API.usePlacesPostItemMutation()

    const [updatePlace, { data: updatePlaceData, isLoading: updateLoading }] =
        API.usePlacesPatchItemMutation()

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleChangeCategory = (category?: DropdownOption) => {
        setFormData({ ...formData, category: String(category?.key) })
    }

    const handleMapBounds = (bounds: LatLngBounds) => {
        const mapCenter = bounds.getCenter()

        if (
            !placeId ||
            (placeId &&
                formData?.coordinates?.lat &&
                formData?.coordinates?.lon)
        ) {
            setFormData({
                ...formData,
                coordinates: {
                    lat: mapCenter.lat,
                    lon: mapCenter.lng
                }
            })
        }

        debounceSetMapBounds(bounds)
    }

    const handleSelectTags = (value: string[]) => {
        setFormData({ ...formData, tags: value })
    }

    const handleContentChange = (text?: string) => {
        setFormData({ ...formData, content: text || '' })
    }

    useEffect(() => {
        if (values) {
            setFormData(values)
        }
    }, [placeId])

    const handleSubmit = () => {
        const errors: PlaceFormErrors = {
            category: !formData?.category
                ? 'Выберите одну из категорий'
                : undefined,
            title: !formData?.title
                ? 'Введите заголовок интересного места'
                : undefined
        }

        setFormErrors(errors)

        if (!errors.title && !errors.category) {
            if (!placeId) {
                createPlace({ ...formData })
            } else {
                const title = formData?.title?.trim()
                const content = formData?.content?.trim()

                updatePlace({
                    ...formData,
                    content: content !== values?.content ? content : undefined,
                    id: placeId,
                    title: title !== values?.title ? title : undefined
                })
            }
        }
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

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds) => {
            setMapBounds(bounds.toBBoxString())
        }, 500),
        []
    )

    useEffect(() => {
        if (createPlaceData?.id) {
            router.push(`/places/${createPlaceData.id}`)
        }
    }, [createPlaceData])

    return (
        <section className={styles.component}>
            {(formErrors?.title || formErrors?.category) && (
                <Message
                    type={'negative'}
                    title={'Исправте ошибки'}
                    list={[formErrors?.title || '', formErrors?.category || '']}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    name={'title'}
                    label={'Заголовок интересного места'}
                    placeholder={'Введите заголовок интересного места'}
                    value={formData?.title}
                    error={formErrors?.title}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Dropdown
                    clearable={true}
                    label={'Категория интересного места'}
                    placeholder={'Выберите категорию'}
                    error={formErrors?.category}
                    value={selectedCategory}
                    options={categoryOptions}
                    onSelect={handleChangeCategory}
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
                    enableSearch={true}
                    places={poiListData?.items}
                    storeMapPosition={!placeId}
                    center={
                        placeId
                            ? [
                                  values?.coordinates?.lat!,
                                  values?.coordinates?.lon!
                              ]
                            : undefined
                    }
                    userLatLon={location}
                    onChangeBounds={handleMapBounds}
                />
            </div>

            <div className={styles.formElement}>
                <label>{'Описание'}</label>
                <ContentEditor
                    markdown={values?.content ?? formData?.content ?? ''}
                    onChange={handleContentChange}
                />
            </div>

            <div className={styles.formButtons}>
                <Button
                    mode={'primary'}
                    onClick={handleSubmit}
                >
                    {'Сохранить'}
                </Button>
            </div>
        </section>
    )
}
export default PlaceForm