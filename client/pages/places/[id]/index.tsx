import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Container } from 'simple-react-ui-kit'

import { GetServerSidePropsResult, NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { JsonLdScript } from 'next-seo'
import { generateNextSeo } from 'next-seo/pages'

import { API, ApiModel, ApiType } from '@/api'
import { openAuthDialog, setLocale } from '@/app/applicationSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/app/store'
import { AppLayout, PhotoGallery, PlacesListItem } from '@/components/shared'
import { Carousel } from '@/components/ui'
import { IMG_HOST, SITE_LINK } from '@/config/env'
import {
    PlaceActionBar,
    PlaceActivity,
    PlaceCommentList,
    PlaceDescription,
    PlaceHero,
    PlaceInfoSidebar,
    PlaceVisited
} from '@/sections/place'
import { formatDateISO, formatDateUTC, removeMarkdown, truncateText } from '@/utils/helpers'
import { buildHreflangTags } from '@/utils/seo'
import { hydrateAuthFromCookies } from '@/utils/serverSideAuth'

import styles from './styles.module.sass'

const PlaceCoverEditor = dynamic(
    () =>
        import('@/sections/place/place-cover-editor/PlaceCoverEditor').then((m) => ({
            default: m.PlaceCoverEditor
        })),
    { ssr: false }
)

const PhotoUploader = dynamic(
    () => import('@/components/shared/photo-uploader/PhotoUploader').then((m) => ({ default: m.PhotoUploader })),
    { ssr: false }
)

const NEAR_PLACES_COUNT = 10

interface PlacePageProps {
    ratingCount: number
    place?: ApiModel.Place
    photoList?: ApiModel.Photo[]
    nearPlaces?: ApiModel.Place[] | null
    commentList?: ApiModel.Comment[]
}

const PlacePage: NextPage<PlacePageProps> = ({ ratingCount, place, photoList, nearPlaces, commentList }) => {
    const { t, i18n } = useTranslation()

    const dispatch = useAppDispatch()

    const inputFileRef = useRef<HTMLInputElement>(null)

    const [coverEditorOpen, setCoverEditorOpen] = useState<boolean>(false)
    const [coverHash, setCoverHash] = useState<number | undefined>()
    const [localPhotos, setLocalPhotos] = useState<ApiModel.Photo[]>(photoList ?? [])
    const [uploadingPhotos, setUploadingPhotos] = useState<string[]>()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const pagePlaceUrl = `${canonicalUrl}places/${place?.id}`

    const handleSaveCover = () => {
        setTimeout(() => setCoverHash(Math.floor(Date.now() / 1000)), 400)
    }

    const handleEditPlaceCoverClick = () => {
        if (!isAuth) {
            dispatch(openAuthDialog())
            return
        }

        setCoverEditorOpen(true)
    }

    const handleUploadPhotoClick = (event: React.MouseEvent | undefined) => {
        event?.preventDefault()

        if (!isAuth) {
            dispatch(openAuthDialog())
        } else {
            inputFileRef?.current?.click()
        }
    }

    const breadCrumbSchema = useMemo(
        () => ({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    item: canonicalUrl,
                    name: t('geotags'),
                    position: 1
                },
                {
                    '@type': 'ListItem',
                    item: `${canonicalUrl}places`,
                    name: t('interesting-places'),
                    position: 2
                },
                {
                    '@type': 'ListItem',
                    item: pagePlaceUrl,
                    name: place?.title,
                    position: 3
                }
            ]
        }),
        [canonicalUrl, pagePlaceUrl, place?.title, t]
    )

    const placeSchema = useMemo(
        () => ({
            '@context': 'https://schema.org',
            '@type': ['TouristAttraction', 'LocalBusiness'],
            '@id': pagePlaceUrl,
            address: {
                '@type': 'PostalAddress',
                addressCountry: place?.address?.country?.name
                    ? { '@type': 'Country', name: place.address.country.name }
                    : undefined,
                addressLocality: place?.address?.locality?.name,
                addressRegion: place?.address?.region?.name,
                streetAddress: place?.address?.street
            },
            aggregateRating: ratingCount
                ? {
                      '@type': 'AggregateRating',
                      bestRating: '5',
                      ratingCount: ratingCount,
                      ratingValue: String(place?.rating),
                      worstRating: '1'
                  }
                : undefined,
            author: {
                '@type': 'Person',
                image: place?.author?.avatar ? `${IMG_HOST}${place?.author?.avatar}` : undefined,
                name: place?.author?.name,
                url: `${canonicalUrl}users/${place?.author?.id}`
            },
            dateModified: formatDateISO(place?.updated?.date),
            datePublished: formatDateISO(place?.created?.date),
            description: removeMarkdown(place?.content),
            geo: {
                '@type': 'GeoCoordinates',
                latitude: place?.lat,
                longitude: place?.lon
            },
            image: (() => {
                const imgs = [
                    ...(place?.cover ? [`${IMG_HOST}${place.cover.full}`] : []),
                    ...(photoList?.map(({ full }) => `${IMG_HOST}${full}`) ?? [])
                ]
                return imgs.length ? imgs : undefined
            })(),
            interactionStatistic: {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/ViewAction',
                userInteractionCount: place?.views
            },
            name: place?.title,
            url: pagePlaceUrl
        }),
        [canonicalUrl, pagePlaceUrl, photoList, place, ratingCount]
    )

    useEffect(() => {
        setLocalPhotos(photoList ?? [])
    }, [photoList])

    return (
        <AppLayout>
            <Head>
                {generateNextSeo({
                    title: place?.title,
                    description: truncateText(removeMarkdown(place?.content)?.replace(/\n/g, ' '), 155),
                    canonical: pagePlaceUrl,
                    openGraph: {
                        article: {
                            authors: [`${SITE_LINK}users/${place?.author?.id}`],
                            modifiedTime: formatDateUTC(place?.updated?.date),
                            publishedTime: formatDateUTC(place?.created?.date),
                            section: place?.category?.title,
                            tags: place?.tags
                        },
                        description: truncateText(removeMarkdown(place?.content)?.replace(/\n/g, ' '), 155),
                        images: [
                            ...(place?.cover
                                ? [
                                      {
                                          alt: place.title || '',
                                          url: `${IMG_HOST}${place.cover.full}`,
                                          width: 1024,
                                          height: 350
                                      }
                                  ]
                                : []),
                            ...(photoList?.slice(0, 3).map((photo, index) => ({
                                alt: `${photo.title} (${index + 1})`,
                                height: photo.height,
                                url: `${IMG_HOST}${photo.full}`,
                                width: photo.width
                            })) ?? [])
                        ],
                        locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                        siteName: t('geotags'),
                        title: place?.title,
                        type: 'article',
                        url: pagePlaceUrl
                    },
                    twitter: { cardType: 'summary_large_image' },
                    additionalLinkTags: buildHreflangTags(`places/${place?.id}`)
                })}
            </Head>

            <JsonLdScript
                scriptKey={'place-breadcrumb'}
                data={breadCrumbSchema}
            />
            <JsonLdScript
                scriptKey={'place-schema'}
                data={placeSchema}
            />

            <PlaceHero
                place={place}
                coverHash={coverHash}
                onChangePlaceCoverClick={handleEditPlaceCoverClick}
                onPhotoUploadClick={handleUploadPhotoClick}
            />

            <div className={styles.pageLayout}>
                <div className={styles.mainColumn}>
                    <PlaceActionBar
                        placeId={place?.id}
                        placeUrl={pagePlaceUrl}
                        bookmarks={place?.bookmarks}
                        verificationExempt={place?.verificationExempt}
                    />

                    <PlaceDescription
                        placeId={place?.id}
                        content={place?.content}
                        tags={place?.tags}
                    />

                    <PhotoGallery
                        title={t('photos')}
                        photos={localPhotos}
                        uploadingPhotos={uploadingPhotos}
                        action={
                            <Button
                                mode={'link'}
                                onClick={handleUploadPhotoClick}
                            >
                                {t('upload-photo')}
                            </Button>
                        }
                    />

                    <Container title={t('comments-title')}>
                        <PlaceCommentList
                            placeId={place?.id}
                            comments={commentList}
                        />
                    </Container>

                    <PlaceActivity
                        placeId={place?.id}
                        hidePlaceName={true}
                    />
                </div>

                <aside className={styles.sidebar}>
                    <PlaceInfoSidebar place={place} />
                    <PlaceVisited place={place} />
                </aside>
            </div>

            {!!nearPlaces?.length && (
                <div className={styles.nearPlaces}>
                    <Carousel options={{ dragFree: true, loop: true }}>
                        {nearPlaces.map((nearPlace) => (
                            <PlacesListItem
                                t={t}
                                key={nearPlace.id}
                                place={nearPlace}
                            />
                        ))}
                    </Carousel>

                    <Button
                        size={'medium'}
                        mode={'secondary'}
                        noIndex={true}
                        stretched={true}
                        link={`/places?lat=${place?.lat}&lon=${place?.lon}&sort=distance&order=ASC`}
                    >
                        {t('all-places-nearby')}
                    </Button>
                </div>
            )}

            <PlaceCoverEditor
                placeId={place?.id}
                open={coverEditorOpen}
                onClose={() => setCoverEditorOpen(false)}
                onSaveCover={handleSaveCover}
            />

            <PhotoUploader
                placeId={place?.id}
                fileInputRef={inputFileRef}
                onSelectFiles={setUploadingPhotos}
                onUploadPhoto={(photo) => {
                    setLocalPhotos([photo, ...localPhotos])
                }}
            />
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacePageProps>> => {
            const id = typeof context.params?.id === 'string' ? context.params.id : undefined
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiType.Locale
            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string') {
                return { notFound: true }
            }

            hydrateAuthFromCookies(store, cookies)
            store.dispatch(setLocale(locale))

            const { data: placeData, isError } = await store.dispatch(API.endpoints.placesGetItem.initiate({ id }))

            if (isError) {
                return { notFound: true }
            }

            const [{ data: ratingData }, { data: photosData }, { data: commentsData }, { data: nearPlaces }] =
                await Promise.all([
                    store.dispatch(API.endpoints.ratingGetList.initiate(id)),
                    store.dispatch(API.endpoints.photosGetList.initiate({ place: id })),
                    store.dispatch(API.endpoints.commentsGetList.initiate({ place: id })),
                    store.dispatch(
                        API.endpoints.placesGetList.initiate({
                            excludePlaces: [id],
                            lat: placeData?.lat,
                            limit: NEAR_PLACES_COUNT,
                            lon: placeData?.lon,
                            order: ApiType.SortOrders.ASC,
                            sort: ApiType.SortFields.Distance
                        })
                    )
                ])

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    commentList: commentsData?.items,
                    nearPlaces: nearPlaces?.items ?? null,
                    photoList: photosData?.items,
                    place: placeData,
                    ratingCount: ratingData?.count ?? 0
                }
            }
        }
)

export default PlacePage
