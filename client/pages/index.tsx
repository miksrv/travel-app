import React from 'react'

import type { GetServerSidePropsResult, NextPage } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { JsonLdScript } from 'next-seo'
import { generateNextSeo } from 'next-seo/pages'

import { API, ApiModel, ApiType } from '@/api'
import { setLocale } from '@/app/applicationSlice'
import { wrapper } from '@/app/store'
import { AppLayout } from '@/components/shared'
import { ActivityFeed, UsersList } from '@/components/widgets'
import { SITE_LINK } from '@/config/env'
import { MapHero, PopularCategories, PopularPlaces } from '@/sections/home'
import { PlaceSchema, UserSchema } from '@/utils/schema'
import { buildHreflangTags } from '@/utils/seo'
import { hydrateAuthFromCookies } from '@/utils/serverSideAuth'

import styles from './index.module.sass'

interface IndexPageProps {
    placesList: ApiModel.Place[]
    usersList: ApiModel.User[]
    activityList: ApiModel.Activity[]
    topCategories: ApiModel.TopCategory[]
    stats?: ApiType.Stats.GetResponse
}

const IndexPage: NextPage<IndexPageProps> = ({ placesList, usersList, activityList, topCategories, stats }) => {
    const { t, i18n } = useTranslation()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    return (
        <AppLayout transparentBar={true}>
            <Head>
                {generateNextSeo({
                    title: t('home-seo-title'),
                    description: t('geotags-description'),
                    canonical: canonicalUrl,
                    openGraph: {
                        description: t('geotags-description'),
                        images: [
                            {
                                alt: t('home-seo-title'),
                                height: 1538,
                                url: `${SITE_LINK}images/pages/main.jpg`,
                                width: 1768
                            }
                        ],
                        locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                        siteName: t('geotags'),
                        title: t('home-seo-title'),
                        type: 'website',
                        url: canonicalUrl
                    },
                    twitter: { cardType: 'summary_large_image' },
                    additionalLinkTags: buildHreflangTags('')
                })}
            </Head>
            <JsonLdScript
                scriptKey={'organization'}
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    logo: `${SITE_LINK}android-chrome-512x512.png`,
                    name: t('geotags'),
                    url: SITE_LINK
                }}
            />
            <JsonLdScript
                scriptKey={'website'}
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: t('geotags'),
                    url: SITE_LINK,
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${SITE_LINK}places?search={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    }
                }}
            />
            <JsonLdScript
                scriptKey={'places-users'}
                data={[
                    ...placesList.map((place) => PlaceSchema(place, SITE_LINK)),
                    ...usersList.map((user) => UserSchema(user, SITE_LINK))
                ]}
            />

            <MapHero stats={stats} />

            <PopularPlaces places={placesList} />

            <div className={styles.twoColumns}>
                <ActivityFeed
                    scrollable={true}
                    compact={true}
                    title={t('activity-feed')}
                    activities={activityList}
                    actionHref={'/activity'}
                    actionLabel={t('all')}
                    actionTitle={t('news-feed')}
                />

                <UsersList
                    compact={true}
                    scrollable={true}
                    title={t('active-users')}
                    users={usersList}
                    actionHref={'/users'}
                    actionLabel={t('all')}
                    actionTitle={t('all-users')}
                />
            </div>

            <PopularCategories categories={topCategories} />
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<IndexPageProps>> => {
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiType.Locale
            const translations = await serverSideTranslations(locale)

            hydrateAuthFromCookies(store, cookies)
            store.dispatch(setLocale(locale))

            const [
                { data: placesList },
                { data: usersList },
                { data: stats },
                { data: activityList },
                { data: topCategoriesData }
            ] = await Promise.all([
                store.dispatch(
                    API.endpoints.placesGetList.initiate({
                        limit: 6,
                        order: ApiType.SortOrders.DESC,
                        sort: ApiType.SortFields.Trending
                    })
                ),
                store.dispatch(API.endpoints.usersGetList.initiate({ limit: 15 })),
                store.dispatch(API.endpoints.statsGetSummary.initiate()),
                store.dispatch(API.endpoints.activityGetList.initiate({ limit: 40 })),
                store.dispatch(API.endpoints.categoriesGetTop.initiate({ limit: 6 }))
            ])

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    activityList: activityList?.items || [],
                    placesList: placesList?.items || [],
                    stats: stats ?? undefined,
                    topCategories: topCategoriesData?.items ?? [],
                    usersList: usersList?.items || []
                }
            }
        }
)

export default IndexPage
