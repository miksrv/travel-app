import React, { useEffect, useState } from 'react'
import type { GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes, Place } from '@/api/types'
import type { Item } from '@/api/types/Activity'
import type { Photo } from '@/api/types/Photo'
import type { User } from '@/api/types/User'
import ActivityList from '@/components/activity-list'
import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import PhotoGallery from '@/components/photo-gallery'
import PlacesListItem from '@/components/places-list/PlacesListItem'
import UsersList from '@/components/users-list'
import { LOCAL_STORAGE } from '@/functions/constants'
import { PlaceSchema, UserSchema } from '@/functions/schema'
import Button from '@/ui/button'
import Carousel from '@/ui/carousel'

interface IndexPageProps {
    placesList: Place.Place[]
    usersList: User[]
    photosList: Photo[]
}

const IndexPage: NextPage<IndexPageProps> = ({ placesList, usersList, photosList }) => {
    const { t, i18n } = useTranslation()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en' : '')

    const [lastDate, setLastDate] = useState<string>()
    const [activityCache, setActivityCache] = useState<Item[]>([])

    const { data, isFetching } = API.useActivityGetInfinityListQuery({ date: lastDate })

    useEffect(() => {
        const onScroll = () => {
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 20

            if (scrolledToBottom && !isFetching && !!data?.items.length) {
                setLastDate(data.items[data.items.length - 1].created?.date)
            }
        }

        document.addEventListener('scroll', onScroll)

        return () => {
            document.removeEventListener('scroll', onScroll)
        }
    }, [lastDate, isFetching, data])

    useEffect(() => {
        if (data?.items) {
            setActivityCache([...(activityCache || []), ...data.items])
        }
    }, [data?.items])

    useEffect(() => {
        setActivityCache([])
        setLastDate(undefined)
    }, [])

    return (
        <AppLayout>
            <Head>
                <script
                    type={'application/ld+json'}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify([
                            ...placesList.map((place) => PlaceSchema(place)),
                            ...usersList.map((user) => UserSchema(user))
                        ])
                    }}
                />
            </Head>

            <NextSeo
                title={t('news-feed')}
                description={t('geotags-description')}
                canonical={canonicalUrl}
                openGraph={{
                    description: t('geotags-description'),
                    images: [
                        {
                            height: 1538,
                            url: '/images/pages/main.jpg',
                            width: 1768
                        }
                    ],
                    locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                    siteName: t('geotags'),
                    title: t('news-feed'),
                    type: 'website',
                    url: canonicalUrl
                }}
            />

            <Header
                title={t('geotags')}
                currentPage={t('updated-geotags-users-photos')}
            />

            <Carousel options={{ dragFree: true, loop: true }}>
                {placesList.map((place) => (
                    <PlacesListItem
                        t={t}
                        key={place.id}
                        place={place}
                    />
                ))}
            </Carousel>

            <Button
                size={'medium'}
                mode={'secondary'}
                stretched={true}
                link={'/places'}
                style={{ margin: '5px 0' }}
            >
                {t('all-geotags')}
            </Button>

            <UsersList
                t={t}
                title={t('active-users')}
                users={usersList}
                action={
                    <Link
                        href={'/users'}
                        title={t('all-users')}
                    >
                        {t('all')}
                    </Link>
                }
            />

            <PhotoGallery
                title={t('last-uploaded-photos')}
                photos={photosList}
            />

            <ActivityList
                title={t('news-feed')}
                activities={activityCache}
                loading={isFetching}
            />
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<IndexPageProps>> => {
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType
            const translations = await serverSideTranslations(locale)

            let lat = null
            let lon = null

            if (cookies[LOCAL_STORAGE.LOCATION]) {
                const userLocation = cookies[LOCAL_STORAGE.LOCATION]?.split(';')

                if (userLocation?.[0] && userLocation[1]) {
                    lat = parseFloat(userLocation[0])
                    lon = parseFloat(userLocation[1])
                }
            }

            store.dispatch(setLocale(locale))

            const { data: placesList } = await store.dispatch(
                API.endpoints.placesGetList.initiate({
                    lat,
                    limit: 6,
                    lon,
                    order: ApiTypes.SortOrders.DESC,
                    sort: ApiTypes.SortFields.Updated
                })
            )

            const { data: usersList } = await store.dispatch(
                API.endpoints.usersGetList.initiate({
                    limit: 4
                })
            )

            const { data: photosList } = await store.dispatch(
                API.endpoints.photosGetList.initiate({
                    limit: 8
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    photosList: photosList?.items || [],
                    placesList: placesList?.items || [],
                    usersList: usersList?.items || []
                }
            }
        }
)

export default IndexPage
