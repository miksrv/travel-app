import { PlacePageProps } from '@/pages/places/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import React from 'react'
import { Article, BreadcrumbList } from 'schema-dts'

import Button from '@/ui/button'

import { API, IMG_HOST, SITE_LINK } from '@/api/api'

import PlaceDescription from '@/components/page-place/description'
import PlaceHeader from '@/components/page-place/header'
import PlaceInformation from '@/components/page-place/information'
import PlacePhotos from '@/components/page-place/photos'
import SocialRating from '@/components/page-place/social-rating'
import PlacesList from '@/components/places-list'

import { formatDateISO, formatDateUTC } from '@/functions/helpers'

interface PlaceProps extends Omit<PlacePageProps, 'randomId' | 'page'> {}

const Place: React.FC<PlaceProps> = ({ place, photoList, nearPlaces }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.place'
    })

    const { data: ratingData } = API.useRatingGetListQuery(place?.id!, {
        skip: !place?.id
    })

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const pagePlaceUrl = `${canonicalUrl}places/${place?.id}`

    const breadCrumbSchema: BreadcrumbList = {
        // @ts-ignore
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                item: `${canonicalUrl}places`,
                name: t('breadCrumbPlacesLink'),
                position: 1
            },
            {
                '@type': 'ListItem',
                name: place?.title,
                position: 2
            }
        ]
    }

    const placeSchema: Article = {
        // @ts-ignore
        '@context': 'https://schema.org',
        '@type': 'Article',
        accessMode: ['textual', 'visual'],
        // Google support only this types:
        // https://developers.google.com/search/docs/appearance/structured-data/review-snippet
        // aggregateRating: {
        //     '@type': 'AggregateRating',
        //     bestRating: 5,
        //     ratingCount: voteCount,
        //     ratingValue: place?.rating
        // },
        articleBody: place?.content,
        author: {
            '@type': 'Person',
            image: place?.author?.avatar
                ? `${IMG_HOST}${place?.author?.avatar}`
                : undefined,
            name: place?.author?.name,
            url: `${canonicalUrl}users/${place?.author?.id}`
        },
        contentLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressCountry: place?.address?.country?.title,
                addressLocality: place?.address?.locality?.title,
                addressRegion: place?.address?.region?.title,
                streetAddress: place?.address?.street
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: place?.lat,
                longitude: place?.lon
            }
        },
        dateModified: formatDateISO(place?.updated?.date),
        datePublished: formatDateISO(place?.created?.date),
        headline: place?.title,
        image: photoList?.length
            ? photoList?.map((photo) => ({
                  '@type': 'ImageObject',
                  author: photo.author?.name,
                  caption: photo.title,
                  contentUrl: `${IMG_HOST}${photo?.full}`,
                  height: `${photo.height}px`,
                  url: `${IMG_HOST}${photo?.full}`,
                  width: `${photo.width}px`
              }))
            : undefined,
        interactionStatistic: {
            '@type': 'InteractionCounter',
            userInteractionCount: place?.views
        },
        wordCount: place?.content.trim().split(/\s+/).length
    }

    return (
        <>
            <Head>
                <script
                    type={'application/ld+json'}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadCrumbSchema)
                    }}
                />
                <script
                    type={'application/ld+json'}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(placeSchema)
                    }}
                />
            </Head>

            <NextSeo
                title={place?.title}
                description={place?.content?.substring(0, 160)}
                canonical={pagePlaceUrl}
                openGraph={{
                    article: {
                        authors: [`${SITE_LINK}users/${place?.author?.id}`],
                        modifiedTime: formatDateUTC(place?.updated?.date),
                        publishedTime: formatDateUTC(place?.created?.date),
                        section: place?.category?.name,
                        tags: place?.tags
                    },
                    description: place?.content?.substring(0, 250),
                    images: photoList?.slice(0, 3).map((photo, index) => ({
                        alt: `${photo.title} (${index + 1})`,
                        height: photo.height,
                        url: `${IMG_HOST}${photo.full}`,
                        width: photo.width
                    })),
                    locale: i18n.language,
                    siteName: t('siteName'),
                    title: place?.title,
                    type: 'http://ogp.me/ns/article#',
                    url: pagePlaceUrl
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

            <PlaceInformation place={place} />

            <PlacePhotos
                photos={photoList}
                placeId={place?.id}
            />

            <PlaceDescription
                placeId={place?.id}
                content={place?.content}
                tags={place?.tags}
            />

            <SocialRating
                placeId={place?.id}
                placeUrl={pagePlaceUrl}
                ratingValue={ratingData?.vote}
            />

            <PlacesList places={nearPlaces} />

            <Button
                size={'m'}
                mode={'secondary'}
                stretched={true}
                noIndex={true}
                link={`/places?lat=${place?.lat}&lon=${place?.lon}&sort=distance&order=ASC`}
                style={{ marginTop: '15px' }}
            >
                {t('allNearPlacesButton')}
            </Button>
        </>
    )
}

export default Place
