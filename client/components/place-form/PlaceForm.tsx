import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@/ui/button'
import ChipsSelect from '@/ui/chips-select'
import ContentEditor from '@/ui/content-editor'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import Input from '@/ui/input'
import Message from '@/ui/message'
import ScreenSpinner from '@/ui/screen-spinner'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

interface PlaceFormProps {
    placeId?: string
    loading?: boolean
    values?: ApiTypes.RequestPlacesPostItem
    errors?: ApiTypes.RequestPlacesPostItem
    onSubmit?: (formData?: ApiTypes.RequestPlacesPostItem) => void
    onCancel?: () => void
}

const PlaceForm: React.FC<PlaceFormProps> = ({
    placeId,
    loading,
    values,
    errors,
    onSubmit,
    onCancel
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placeForm'
    })

    const location = useAppSelector((state) => state.application.userLocation)
    const [mapBounds, setMapBounds] = useState<string>()
    const [formData, setFormData] = useState<ApiTypes.RequestPlacesPostItem>()
    const [formErrors, setFormErrors] =
        useState<ApiTypes.RequestPlacesPostItem>()

    const { data: poiListData } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    const [searchTags, { data: searchResult, isLoading: searchLoading }] =
        API.useTagsGetSearchMutation()

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleChangeCategory = (category?: DropdownOption) => {
        setFormData({ ...formData, category: String(category?.key) })
    }

    const handleMapBounds = (bounds: LatLngBounds) => {
        const mapCenter = bounds.getCenter()

        if (
            !placeId ||
            (placeId &&
                (formData?.lat || formData?.lat === 0) &&
                (formData?.lon || formData?.lon === 0))
        ) {
            setFormData({
                ...formData,
                lat: mapCenter.lat,
                lon: mapCenter.lng
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

    const validateForm = useCallback(() => {
        const errors: ApiTypes.RequestPlacesPostItem = {}

        if (!formData?.title) {
            errors.title = t('errorTitle')
        }

        if (!formData?.category) {
            errors.category = t('errorCategory')
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit?.(formData)
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    }

    const handleSearchTags = (value: string) => {
        if (value?.length > 0) {
            searchTags(value)
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
        if (values) {
            setFormData(values)
        }
    }, [placeId])

    useEffect(() => {
        setFormErrors(errors)
    }, [errors])

    return (
        <section className={styles.component}>
            {loading && <ScreenSpinner />}

            {!!Object.values(formErrors || {})?.length && (
                <Message
                    type={'negative'}
                    title={t('errorsMessageTitle')}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    name={'title'}
                    label={t('inputTitleLabel')}
                    placeholder={t('inputTitlePlaceholder')}
                    disabled={loading}
                    value={formData?.title}
                    error={formErrors?.title}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Dropdown
                    clearable={true}
                    label={t('inputCategoryLabel')}
                    placeholder={t('inputCategoryPlaceholder')}
                    disabled={loading}
                    error={formErrors?.category}
                    value={selectedCategory}
                    options={categoryOptions}
                    onSelect={handleChangeCategory}
                />
            </div>

            <div className={styles.formElement}>
                <ChipsSelect
                    label={t('inputTagsLabel')}
                    placeholder={''}
                    disabled={loading}
                    value={formData?.tags}
                    loading={searchLoading}
                    options={searchResult?.items}
                    onSearch={handleSearchTags}
                    onSelect={handleSelectTags}
                />
            </div>

            <div className={styles.mapContainer}>
                <div className={styles.verticalLine} />
                <div className={styles.horizontalLine} />
                {selectedCategory && (
                    <Image
                        className={styles.categoryImage}
                        src={categoryImage(selectedCategory.key)?.src}
                        alt={''}
                        width={17}
                        height={20}
                    />
                )}
                <InteractiveMap
                    enableSearch={true}
                    enableFullScreen={true}
                    enableCoordsControl={true}
                    enableLayersSwitcher={true}
                    places={poiListData?.items}
                    storeMapPosition={!placeId}
                    zoom={placeId ? 15 : undefined}
                    center={
                        placeId && formData
                            ? [formData?.lat!, formData?.lon!]
                            : undefined
                    }
                    userLatLon={location}
                    onChangeBounds={handleMapBounds}
                />
            </div>

            <div className={styles.formElement}>
                <label>{t('inputDescriptionLabel')}</label>
                <ContentEditor
                    value={formData?.content ?? ''}
                    onChange={handleContentChange}
                />
            </div>

            <div className={styles.actions}>
                <Button
                    size={'m'}
                    mode={'primary'}
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {t('buttonSave')}
                </Button>

                <Button
                    size={'m'}
                    mode={'secondary'}
                    disabled={loading}
                    onClick={onCancel}
                >
                    {t('buttonCancel')}
                </Button>
            </div>
        </section>
    )
}
export default PlaceForm
