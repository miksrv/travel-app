import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import React from 'react'

import Button from '@/ui/button'

import { API, SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes, Place } from '@/api/types'
import { Photo } from '@/api/types/Photo'
import { User } from '@/api/types/User'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import UserGallery from '@/components/page-user/gallery'
import PlacesList from '@/components/places-list'
import UsersList from '@/components/users-list'

import { ListItemSchema, PlaceSchema, UserSchema } from '@/functions/schema'

interface IndexPageProps {
    placesList: Place.Place[]
    usersList: User[]
    photosList: Photo[]
}

const IndexPage: NextPage<IndexPageProps> = ({
    placesList,
    usersList,
    photosList
}) => {
    const { t, i18n } = useTranslation('common', { keyPrefix: 'pages.index' })

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en' : '')

    return (
        <AppLayout>
            <Head>
                <script
                    type={'application/ld+json'}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            ListItemSchema([
                                ...placesList.map((place) =>
                                    PlaceSchema(place, canonicalUrl)
                                ),
                                ...usersList.map((user) => UserSchema(user))
                            ])
                        )
                    }}
                />
            </Head>

            <NextSeo
                title={t('title')}
                description={`${t('description')} - ${placesList
                    ?.map(({ title }) => title)
                    .join(', ')
                    .substring(0, 160)}`}
                canonical={canonicalUrl}
            />

            <Header
                hideHomePage={true}
                title={t('title')}
                currentPage={t('title')}
            />

            <PlacesList places={placesList} />

            <Button
                size={'m'}
                mode={'secondary'}
                stretched={true}
                link={'/places'}
                style={{ margin: '15px 0' }}
            >
                {t('buttonAllPlaces')}
            </Button>

            <UsersList
                title={t('titleActiveUsers')}
                users={usersList}
            />

            <UserGallery
                title={t('titleLastPhotos')}
                photos={photosList}
            />
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<IndexPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            const { data: placesList } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    limit: 3,
                    order: ApiTypes.SortOrder.DESC,
                    sort: ApiTypes.SortFields.Updated
                })
            )

            const { data: usersList } = await store.dispatch(
                API.endpoints?.usersGetList.initiate({
                    limit: 8
                })
            )

            const { data: photosList } = await store.dispatch(
                API.endpoints?.photosGetList.initiate({
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
