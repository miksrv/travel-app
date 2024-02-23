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

interface EditProps extends Omit<PlacePageProps, 'randomId' | 'page'> {}

const Edit: React.FC<EditProps> = ({ place }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.edit'
    })

    const router = useRouter()

    const [updatePlace, { error, isLoading, isSuccess }] =
        API.usePlacesPatchItemMutation()

    const placeValuesData: ApiTypes.RequestPlacesPostItem = useMemo(
        () => ({
            category: place?.category?.name,
            content: place?.content,
            lat: place?.lat!,
            lon: place?.lon!,
            tags: place?.tags?.map(({ title }) => title),
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
            content: content !== place?.content ? content : undefined,
            id: place?.id!,
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
                title={`${place?.title} - ${t('pageTitle')}`}
                description={''}
                canonical={`${SITE_LINK}${
                    i18n.language === 'en' ? 'en/' : ''
                }places/${place?.id}/edit`}
            />

            <Header
                title={`${place?.title} - ${t('pageTitle')}`}
                currentPage={t('breadCrumbCurrent')}
                backLink={`/places/${place?.id}`}
                links={[
                    {
                        link: '/places/',
                        text: t('breadCrumbPlacesLink')
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
