import React, { useMemo } from 'react'

import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, ApiModel, ApiType, SITE_LINK } from '@/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import TagsList from '@/components/tags-list'
import { dateToUnixTime } from '@/functions/helpers'

interface TagsPageProps {
    tags: ApiModel.Tag[]
}

const CategoriesPage: NextPage<TagsPageProps> = ({ tags }) => {
    const { t, i18n } = useTranslation()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const tagsList = [...tags]

    const topUpdatedTags = useMemo(
        () => tagsList.sort((a, b) => dateToUnixTime(b.updated?.date) - dateToUnixTime(a.updated?.date)).slice(0, 20),
        [tagsList]
    )

    const topPopularTags = useMemo(
        () =>
            tagsList
                .sort((a, b) => b.count! - a.count!)
                .filter(({ title }) => title !== topUpdatedTags.find((search) => search.title === title)?.title)
                .slice(0, 20),
        [tagsList, topUpdatedTags]
    )

    const otherTags = useMemo(
        () =>
            tagsList
                .sort((a, b) => b.count! - a.count!)
                .filter(
                    ({ title }) =>
                        title !== topUpdatedTags.find((search) => search.title === title)?.title &&
                        title !== topPopularTags.find((search) => search.title === title)?.title
                ),
        [tagsList, topUpdatedTags, topPopularTags]
    )

    return (
        <AppLayout>
            <NextSeo
                title={t('hashtags')}
                canonical={`${canonicalUrl}tags`}
                description={tagsList
                    ?.map(({ title }) => title)
                    ?.join(',')
                    ?.substring(0, 220)}
            />

            <Header
                title={t('hashtags')}
                homePageTitle={t('geotags')}
                currentPage={t('hashtags')}
            />

            <TagsList
                title={t('last-used')}
                tags={topUpdatedTags}
            />

            <TagsList
                title={t('most-popular')}
                tags={topPopularTags}
            />

            <TagsList
                title={t('other')}
                tags={otherTags}
            />
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<TagsPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiType.Locale
            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            const { data: tagsList } = await store.dispatch(API.endpoints.tagsGetList.initiate())

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    tags: tagsList?.items ?? []
                }
            }
        }
)

export default CategoriesPage
