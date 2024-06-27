import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { BreadcrumbList, LocalBusiness } from 'schema-dts'

import { IMG_HOST, SITE_LINK } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Photo } from '@/api/types/Photo'
import Comments from '@/components/page-place/comments'
import PlaceDescription from '@/components/page-place/description'
import PlaceHeader from '@/components/page-place/header'
import PlaceInformation from '@/components/page-place/information'
import SocialRating from '@/components/page-place/social-rating'
import PhotoGallery from '@/components/photo-gallery'
import PhotoUploader from '@/components/photo-uploader/PhotoUploader'
import PlaceCoverEditor from '@/components/place-cover-editor'
import { PlaceCoverEditorHandle } from '@/components/place-cover-editor/PlaceCoverEditor'
import PlacesListItem from '@/components/places-list/PlacesListItem'
import { dateToUnixTime, formatDateUTC } from '@/functions/helpers'
import { PlacePageProps } from '@/pages/places/[...slug]'
import Button from '@/ui/button'
import Carousel from '@/ui/carousel'
import Container from '@/ui/container'

interface PlaceProps extends Omit<PlacePageProps, 'page'> {}

const KEY = 'components.pagePlace.place.'

const Place: React.FC<PlaceProps> = ({ place, photoList, ratingCount, nearPlaces }) => {
    const dispatch = useAppDispatch()
    const { t, i18n } = useTranslation()

    const placeCoverEditorRef = useRef<PlaceCoverEditorHandle>(null)
    const inputFileRef = useRef<HTMLInputElement>()

    const [coverHash, setCoverHash] = useState<number>(dateToUnixTime(place?.updated?.date))
    const [localPhotos, setLocalPhotos] = useState<Photo[]>(photoList ?? [])
    const [uploadingPhotos, setUploadingPhotos] = useState<string[]>()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const pagePlaceUrl = `${canonicalUrl}places/${place?.id}`

    const handleSaveCover = () => {
        setTimeout(() => setCoverHash(Math.floor(Date.now() / 1000)), 400)
    }

    const handleEditPlaceCoverClick = () => {
        if (placeCoverEditorRef?.current) {
            placeCoverEditorRef.current?.handleChangeCoverClick({} as React.MouseEvent)
        }
    }

    const handleUploadPhotoClick = (event: React.MouseEvent | undefined) => {
        event?.preventDefault()

        if (!isAuth) {
            dispatch(openAuthDialog())
        } else {
            inputFileRef?.current?.click()
        }
    }

    const breadCrumbSchema: BreadcrumbList | any = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                item: `${canonicalUrl}places`,
                name: t(`${KEY}breadCrumbPlacesLink`),
                position: 1
            },
            {
                '@type': 'ListItem',
                name: place?.title,
                position: 2
            }
        ]
    }

    const placeSchema: LocalBusiness | any = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        address: {
            '@type': 'PostalAddress',
            addressCountry: place?.address?.country?.title,
            addressLocality: place?.address?.locality?.title,
            addressRegion: place?.address?.region?.title,
            streetAddress: place?.address?.street
        },
        aggregateRating: ratingCount
            ? {
                  '@type': 'AggregateRating',
                  bestRating: '5',
                  ratingCount: ratingCount ?? 0,
                  ratingValue: place?.rating,
                  worstRating: '1'
              }
            : undefined,
        // author: {
        //     '@type': 'Person',
        //     image: place?.author?.avatar
        //         ? `${IMG_HOST}${place?.author?.avatar}`
        //         : undefined,
        //     name: place?.author?.name,
        //     url: `${canonicalUrl}users/${place?.author?.id}`
        // },
        // dateModified: formatDateISO(place?.updated?.date),
        // datePublished: formatDateISO(place?.created?.date),
        description: place?.content,
        geo: {
            '@type': 'GeoCoordinates',
            latitude: place?.lat,
            longitude: place?.lon
        },
        image: photoList?.length ? photoList.map(({ full }) => `${IMG_HOST}${full}`) : undefined,
        interactionStatistic: {
            '@type': 'InteractionCounter',
            userInteractionCount: place?.views
        },
        name: place?.title
    }

    useEffect(() => {
        setLocalPhotos(photoList ?? [])
    }, [photoList])

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
                description={place?.content?.substring(0, 220)}
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
                    locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                    siteName: t('siteName'),
                    title: place?.title,
                    type: 'http://ogp.me/ns/article#',
                    url: pagePlaceUrl
                }}
            />

            <PlaceHeader
                place={place}
                coverHash={coverHash}
                onChangePlaceCoverClick={handleEditPlaceCoverClick}
                onPhotoUploadClick={handleUploadPhotoClick}
            />

            <PlaceInformation place={place} />

            <SocialRating
                placeId={place?.id}
                placeUrl={pagePlaceUrl}
            />

            <Container
                title={t(`${KEY}photos`)}
                action={
                    <Button
                        mode={'link'}
                        onClick={handleUploadPhotoClick}
                    >
                        {t(`${KEY}uploadPhoto`)}
                    </Button>
                }
            >
                <PhotoGallery
                    photos={localPhotos}
                    uploadingPhotos={uploadingPhotos}
                />
            </Container>

            <PlaceDescription
                placeId={place?.id}
                content={place?.content}
                tags={place?.tags}
            />

            <Comments placeId={place?.id ?? ''} />

            {!!nearPlaces?.length && (
                <>
                    <Carousel options={{ dragFree: true, loop: true }}>
                        {nearPlaces.map((place) => (
                            <PlacesListItem
                                key={place.id}
                                place={place}
                            />
                        ))}
                    </Carousel>

                    <Button
                        size={'medium'}
                        mode={'secondary'}
                        stretched={true}
                        noIndex={true}
                        link={`/places?lat=${place?.lat}&lon=${place?.lon}&sort=distance&order=ASC`}
                        style={{ marginTop: '5px' }}
                    >
                        {t(`${KEY}allNearPlacesButton`)}
                    </Button>
                </>
            )}

            <PlaceCoverEditor
                ref={placeCoverEditorRef as any}
                placeId={place?.id}
                onSaveCover={handleSaveCover}
            />

            <PhotoUploader
                placeId={place?.id}
                fileInputRef={inputFileRef}
                onSelectFiles={setUploadingPhotos}
                onUploadPhoto={(photo) => {
                    setLocalPhotos([...localPhotos, photo])
                }}
            />
        </>
    )
}

export default Place
