import React, { useMemo } from 'react'

import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, ApiModel, ApiType, SITE_LINK } from '@/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { AppLayout, Header } from '@/components'
import CategoriesList from '@/components/categories-list'

interface CategoriesPageProps {
    categories: ApiModel.Category[]
}

const CategoriesPage: NextPage<CategoriesPageProps> = ({ categories }) => {
    const { t, i18n } = useTranslation()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const description = useMemo(() => categories.map(({ title }) => title).join(', '), [categories])

    return (
        <AppLayout>
            <NextSeo
                title={t('categories')}
                canonical={`${canonicalUrl}categories`}
                description={`${t('categories')}: ${description}`}
                openGraph={{
                    description: `${t('categories')}: ${description}`,
                    images: [
                        {
                            height: 1402,
                            url: '/images/pages/categories.jpg',
                            width: 1760
                        }
                    ],
                    locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                    siteName: t('geotags'),
                    title: t('categories'),
                    type: 'website',
                    url: `${canonicalUrl}categories`
                }}
            />

            <Header
                title={t('categories')}
                homePageTitle={t('geotags')}
                currentPage={t('categories')}
            />

            <CategoriesList
                t={t}
                categories={categories}
            />
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<CategoriesPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiType.Locale
            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            const { data: categoriesList } = await store.dispatch(
                API.endpoints.categoriesGetList.initiate({ places: true })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    categories: categoriesList?.items ?? []
                }
            }
        }
)

export default CategoriesPage
