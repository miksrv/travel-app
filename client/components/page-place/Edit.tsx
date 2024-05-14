import { PlacePageProps } from '@/pages/places/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'

import Container from '@/ui/container'

import { API, SITE_LINK, isApiValidationErrors } from '@/api/api'
import { ApiTypes } from '@/api/types'

import Header from '@/components/header'
import PlaceForm from '@/components/place-form'

import { equalsArrays } from '@/functions/helpers'

interface EditProps extends Omit<PlacePageProps, 'page'> {}

const TKEY = 'components.pagePlace.edit.'

const Edit: React.FC<EditProps> = ({ place }) => {
    const { t, i18n } = useTranslation()

    const router = useRouter()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const [updatePlace, { error, isLoading, isSuccess }] =
        API.usePlacesPatchItemMutation()

    const placeValuesData: ApiTypes.RequestPlacesPostItem = useMemo(
        () => ({
            category: place?.category?.name,
            content: place?.content,
            lat: place?.lat!,
            lon: place?.lon!,
            tags: place?.tags,
            title: place?.title
        }),
        [place?.id]
    )

    const validationErrors = useMemo(
        () =>
            isApiValidationErrors<ApiTypes.RequestPlacesPostItem>(error)
                ? error?.messages
                : undefined,
        [error]
    )

    const handleCancel = () => {
        router.back()
    }

    const handleSubmit = (formData?: ApiTypes.RequestPlacesPostItem) => {
        const title = formData?.title?.trim()
        const content = formData?.content?.trim()

        updatePlace({
            ...formData,
            category:
                formData?.category !== place?.category?.name
                    ? formData?.category
                    : undefined,
            content: content !== place?.content ? content : undefined,
            id: place?.id!,
            tags: !equalsArrays(place?.tags, formData?.tags)
                ? formData?.tags
                : undefined,
            title: title !== place?.title ? title : undefined
        })
    }

    useEffect(() => {
        if (isSuccess) {
            router.push(`/places/${place?.id}`)
        }
    }, [isSuccess])

    return (
        <>
            <NextSeo
                nofollow={true}
                noindex={true}
                title={`${place?.title} - ${t(`${TKEY}pageTitle`)}`}
                description={''}
                canonical={`${canonicalUrl}places/${place?.id}/edit`}
            />

            <Header
                title={`${place?.title} - ${t(`${TKEY}pageTitle`)}`}
                currentPage={t(`${TKEY}breadCrumbCurrent`)}
                backLink={`/places/${place?.id}`}
                links={[
                    {
                        link: '/places/',
                        text: t(`${TKEY}breadCrumbPlacesLink`)
                    },
                    {
                        link: `/places/${place?.id}`,
                        text: place?.title || ''
                    }
                ]}
            />

            <Container>
                <PlaceForm
                    placeId={place?.id}
                    values={placeValuesData}
                    loading={isLoading || isSuccess}
                    errors={validationErrors}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Container>
        </>
    )
}

export default Edit
