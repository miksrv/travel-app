import { PlacePageProps } from '@/pages/places/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React, { useMemo } from 'react'

import Button from '@/ui/button'
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
    const { t, i18n } = useTranslation('common', {
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

    const pageUrl = `${SITE_LINK}${i18n.language === 'en' ? 'en/' : ''}places/${
        place?.id
    }`

    return (
        <>
            <NextSeo
                title={place?.title}
                description={place?.content?.substring(0, 160)}
                canonical={pageUrl}
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
                        alt: `${photo.title} (${index + 1})`,
                        height: photo.height,
                        url: `${IMG_HOST}${photo.full}`,
                        width: photo.width
                    })),
                    locale: i18n.language,
                    siteName: t('siteName'),
                    title: place?.title,
                    url: pageUrl
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

            <Button
                size={'m'}
                mode={'secondary'}
                stretched={true}
                link={`/places?lat=${place?.lat}&lon=${place?.lon}&sort=distance&order=ASC`}
                style={{ marginTop: '15px' }}
            >
                {t('allNearPlacesButton')}
            </Button>
        </>
    )
}

export default Place
