import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { Photo } from '@/api/types/Photo'
import PhotoGallery from '@/components/photo-gallery'
import PhotoUploadSection from '@/components/photo-upload-section'
import PhotoUploader from '@/components/photo-uploader/PhotoUploader'
import { categoryImage } from '@/functions/categories'
import Button from '@/ui/button'
import ChipsSelect from '@/ui/chips-select'
import ContentEditor from '@/ui/content-editor'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import Input from '@/ui/input'
import Message from '@/ui/message'
import ScreenSpinner from '@/ui/screen-spinner'

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

const PlaceForm: React.FC<PlaceFormProps> = ({ placeId, loading, values, errors, onSubmit, onCancel }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const inputFileRef = useRef<HTMLInputElement>()

    const location = useAppSelector((state) => state.application.userLocation)

    const [mapBounds, setMapBounds] = useState<string>()
    const [formData, setFormData] = useState<ApiTypes.RequestPlacesPostItem>()
    const [formErrors, setFormErrors] = useState<ApiTypes.RequestPlacesPostItem>()
    const [uploadingPhotos, setUploadingPhotos] = useState<string[]>()
    const [localPhotos, setLocalPhotos] = useState<Photo[]>([])

    const { data: poiListData } = API.usePoiGetListQuery({ bounds: mapBounds }, { skip: !mapBounds })
    const { data: categoryData } = API.useCategoriesGetListQuery()

    const [searchTags, { data: searchResult, isLoading: searchLoading }] = API.useTagsGetSearchMutation()

    const handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleChangeCategory = (category?: DropdownOption) => {
        setFormData({ ...formData, category: String(category?.key) })
    }

    const handleMapBounds = (bounds: LatLngBounds) => {
        const mapCenter = bounds.getCenter()

        if (!placeId || (placeId && (formData?.lat || formData?.lat === 0) && (formData.lon || formData.lon === 0))) {
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
            errors.title = t('error_title-required')
        }

        if (!formData?.category) {
            errors.category = t('error_category-required')
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit?.({
                ...formData,
                photos: !placeId && !!localPhotos?.length ? localPhotos?.map(({ id }) => id) : undefined
            })
        } else {
            dispatch(
                Notify({
                    id: 'placeFormError',
                    message: t('correct-errors-on-form'),
                    type: 'error'
                })
            )
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    }

    const handleSearchTags = (value: string) => {
        if (value.length > 0) {
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

    const selectedCategory = categoryOptions?.find(({ key }) => key === formData?.category)

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

            {!!Object.values(formErrors || {}).length && (
                <Message
                    type={'negative'}
                    title={t('correct-errors-on-form')}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    tabIndex={0}
                    required={true}
                    autoFocus={true}
                    name={'title'}
                    label={t('input_geotag-label')}
                    placeholder={t('input_geotag-placeholder')}
                    disabled={loading}
                    value={formData?.title}
                    error={formErrors?.title}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Dropdown
                    required={true}
                    clearable={true}
                    label={t('input_category-label')}
                    placeholder={t('input_category-placeholder')}
                    disabled={loading}
                    error={formErrors?.category}
                    value={selectedCategory}
                    options={categoryOptions}
                    onSelect={handleChangeCategory}
                />
            </div>

            <div className={styles.formElement}>
                <ChipsSelect
                    label={t('input_tags-label')}
                    placeholder={t('input_tags-placeholder')}
                    notFoundCaption={t('nothing-found')}
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
                        src={categoryImage(selectedCategory.key).src}
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
                    scrollWheelZoom={!placeId}
                    places={poiListData?.items}
                    storeMapPosition={!placeId}
                    zoom={placeId ? 15 : undefined}
                    center={placeId && formData ? [formData.lat!, formData.lon!] : undefined}
                    userLatLon={location}
                    onChangeBounds={handleMapBounds}
                />
            </div>

            <div className={styles.formElement}>
                <label>{t('description')}</label>
                <ContentEditor
                    value={formData?.content ?? ''}
                    onChange={handleContentChange}
                />
            </div>

            {!placeId && (
                <div className={styles.formElement}>
                    {localPhotos?.length ? (
                        <div className={styles.formElement}>
                            <PhotoGallery
                                photos={localPhotos}
                                className={styles.gallery}
                                uploadingPhotos={uploadingPhotos}
                                onPhotoDelete={setLocalPhotos}
                                onPhotoUploadClick={() => inputFileRef?.current?.click()}
                            />
                        </div>
                    ) : (
                        <PhotoUploadSection onClick={() => inputFileRef?.current?.click()} />
                    )}
                </div>
            )}

            <div className={styles.actions}>
                <Button
                    size={'medium'}
                    mode={'primary'}
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {t('save')}
                </Button>

                <Button
                    size={'medium'}
                    mode={'secondary'}
                    disabled={loading}
                    onClick={onCancel}
                >
                    {t('cancel')}
                </Button>
            </div>

            {!placeId && (
                <PhotoUploader
                    placeId={'temporary'}
                    fileInputRef={inputFileRef}
                    onSelectFiles={setUploadingPhotos}
                    onUploadPhoto={(photo) => {
                        setLocalPhotos([photo, ...localPhotos])
                    }}
                />
            )}
        </section>
    )
}
export default PlaceForm
