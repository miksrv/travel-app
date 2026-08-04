import React, { useCallback, useMemo } from 'react'
import { Container } from 'simple-react-ui-kit'

import type { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { generateNextSeo } from 'next-seo/pages'

import { API, ApiModel, ApiType } from '@/api'
import { setLocale } from '@/app/applicationSlice'
import { wrapper } from '@/app/store'
import { AppLayout, PageHeader } from '@/components/shared'
import { Pagination } from '@/components/ui'
import { UsersList } from '@/components/widgets'
import { SITE_LINK } from '@/config/env'
import { UsersFilterPanel, UsersFilterType } from '@/sections/user'
import { encodeQueryData } from '@/utils/helpers'
import { buildHreflangTags } from '@/utils/seo'
import { hydrateAuthFromCookies } from '@/utils/serverSideAuth'

const USERS_PER_PAGE = 30
const DEFAULT_SORT = 'activity_at'
const DEFAULT_ORDER = 'DESC'

interface UsersPageProps {
    usersList: ApiModel.User[]
    usersCount: number
    currentPage: number
    search: string | null
    sort: string
    order: string
    withAvatar: boolean
    withPlaces: boolean
}

const UsersPage: NextPage<UsersPageProps> = ({
    usersList,
    usersCount,
    currentPage,
    search,
    sort,
    order,
    withAvatar,
    withPlaces
}) => {
    const { t, i18n } = useTranslation()

    const router = useRouter()

    const initialFilter: UsersFilterType = {
        order: order !== DEFAULT_ORDER ? order : undefined,
        page: currentPage !== 1 ? currentPage : undefined,
        search: search ?? undefined,
        sort: sort !== DEFAULT_SORT ? sort : undefined,
        withAvatar: withAvatar ? '1' : undefined,
        withPlaces: withPlaces ? '1' : undefined
    }

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const title = useMemo(
        () => t('users') + (currentPage && currentPage > 1 ? ` - ${t('page')} ${currentPage}` : ''),
        [currentPage, i18n.language]
    )

    const pushFilter = useCallback(
        async (next: UsersFilterType, resetPage = false) => {
            const update: UsersFilterType = {
                order: next.order && next.order !== DEFAULT_ORDER ? next.order : undefined,
                page: resetPage ? undefined : next.page && next.page !== 1 ? next.page : undefined,
                search: next.search || undefined,
                sort: next.sort && next.sort !== DEFAULT_SORT ? next.sort : undefined,
                withAvatar: next.withAvatar,
                withPlaces: next.withPlaces
            }
            return await router.push('/users' + encodeQueryData(update))
        },
        [router]
    )

    const handleChangeFilter = useCallback(
        async (key: keyof UsersFilterType, value: string | undefined) => {
            const next = { ...initialFilter, [key]: value }
            const changesScope = key !== 'page' && key !== 'sort' && key !== 'order'
            return await pushFilter(next, changesScope && currentPage !== 1)
        },
        [initialFilter, currentPage, pushFilter]
    )

    const handleResetAll = async () => {
        await router.push('/users')
    }

    const filterPanel = (
        <UsersFilterPanel
            search={search ?? undefined}
            sort={sort}
            order={order}
            withAvatar={withAvatar}
            withPlaces={withPlaces}
            onChange={handleChangeFilter}
            onResetAll={handleResetAll}
        />
    )

    return (
        <AppLayout sidebar={filterPanel}>
            <Head>
                {generateNextSeo({
                    title: title,
                    description: `${title} - ${usersList
                        ?.map(({ name }) => name)
                        ?.join(', ')
                        ?.substring(0, 220)}`,
                    canonical: `${canonicalUrl}users${currentPage && currentPage > 1 ? '?page=' + currentPage : ''}`,
                    noindex: true,
                    nofollow: false,
                    openGraph: {
                        description: `${title} - ${usersList
                            ?.map(({ name }) => name)
                            ?.join(', ')
                            ?.substring(0, 220)}`,
                        locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                        siteName: t('geotags'),
                        title,
                        type: 'website',
                        url: `${canonicalUrl}users`
                    },
                    twitter: { cardType: 'summary_large_image' },
                    additionalLinkTags: buildHreflangTags('users')
                })}
            </Head>

            <PageHeader
                title={title}
                homePageTitle={t('geotags')}
                currentPage={t('users')}
            />

            <UsersList users={usersList} />

            <Container className={'paginationContainer'}>
                <div>
                    {t('users_count')}: <strong>{usersCount}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    captionPage={t('page')}
                    captionNextPage={t('next-page')}
                    captionPrevPage={t('prev-page')}
                    totalItemsCount={usersCount}
                    perPage={USERS_PER_PAGE}
                    urlParam={initialFilter}
                    linkPart={'users'}
                />
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<UsersPageProps>> => {
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiType.Locale
            const currentPage = parseInt(context.query.page as string, 10) || 1
            const search = ((context.query.search as string) || '').trim() || null
            const sort = (context.query.sort as string) || DEFAULT_SORT
            const order = (context.query.order as string) || DEFAULT_ORDER
            const withAvatar = (context.query.withAvatar as string) === '1'
            const withPlaces = (context.query.withPlaces as string) === '1'
            const translations = await serverSideTranslations(locale)

            hydrateAuthFromCookies(store, cookies)
            store.dispatch(setLocale(locale))

            const { data: usersList } = await store.dispatch(
                API.endpoints.usersGetList.initiate({
                    limit: USERS_PER_PAGE,
                    offset: (currentPage - 1) * USERS_PER_PAGE,
                    order: order as 'ASC' | 'DESC',
                    search: search ?? undefined,
                    sort: sort as ApiType.Users.UserSortFields,
                    withAvatar: withAvatar ? '1' : undefined,
                    withPlaces: withPlaces ? '1' : undefined
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    currentPage,
                    order,
                    search,
                    sort,
                    usersCount: usersList?.count ?? 0,
                    usersList: usersList?.items ?? [],
                    withAvatar,
                    withPlaces
                }
            }
        }
)

export default UsersPage
