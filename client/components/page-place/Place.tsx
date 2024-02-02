import { SITE_NAME } from '@/pages/_app'
import { PlacePageProps } from '@/pages/places/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React, { useMemo } from 'react'

import Container from '@/ui/container'

import { API, IMG_HOST, SITE_LINK } from '@/api/api'

import PlaceDescription from '@/components/page-place/description'
import PlaceHeader from '@/components/page-place/header'
import PlaceInformation from '@/components/page-place/information'
import PlacePhotos from '@/components/page-place/photos'
import PlacesList from '@/components/places-list'

import { formatDateUTC } from '@/functions/helpers'

interface PlaceProps extends Omit<PlacePageProps, 'randomId' | 'page'> {}

const Place: React.FC<PlaceProps> = ({ place, photoList, nearPlaces }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.place'
    })

    const { data: ratingData, isLoading: ratingLoading } =
        API.useRatingGetListQuery(place?.id!, {
            skip: !place?.id
        })

    const nearPlacesDistance = useMemo(
        () =>
            Math.max(
                ...(nearPlaces?.map(({ distance }) => distance || 0) || [])
            ),
        [nearPlaces]
    )

    return (
        <>
            <NextSeo
                title={place?.title}
                description={place?.content?.substring(0, 160)}
                openGraph={{
                    article: {
                        authors: [`${SITE_LINK}users/${place?.author?.id}`],
                        modifiedTime: formatDateUTC(place?.updated?.date),
                        publishedTime: formatDateUTC(place?.created?.date),
                        section: place?.category?.name,
                        tags: place?.tags?.map(({ title }) => title)
                    },
                    description: place?.content?.substring(0, 160),
                    images: photoList?.map((photo, index) => ({
                        alt: `${photo.title} - Фото ${index + 1}`,
                        height: photo.height,
                        url: `${IMG_HOST}photo/${place?.id}/${photo.filename}_thumb.${photo.extension}`,
                        width: photo.width
                    })),
                    siteName: SITE_NAME,
                    title: place?.title,
                    type: 'article',
                    url: SITE_LINK
                }}
            />

            <PlaceHeader
                place={place}
                ratingValue={ratingData?.rating ?? place?.rating}
                ratingCount={ratingData?.count}
                breadcrumbs={[
                    {
                        link: '/places/',
                        text: t('breadCrumbPlacesLink')
                    }
                ]}
            />

            <PlaceInformation
                place={place}
                ratingValue={ratingData?.vote}
                loading={ratingLoading}
            />

            <PlacePhotos
                photos={photoList}
                placeId={place?.id}
            />

            <PlaceDescription
                placeId={place?.id}
                content={place?.content}
                tags={place?.tags}
            />

            <Container>
                <h2>{t('nearPlacesTitle')}</h2>
                <div className={'headline'}>
                    {t('nearPlacesDescription', {
                        distance: nearPlacesDistance
                    })}
                </div>
            </Container>
            <PlacesList places={nearPlaces} />
        </>
    )
}

export default Place
