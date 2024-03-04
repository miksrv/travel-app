import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React, { useMemo } from 'react'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API, SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { User } from '@/api/types/User'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import UsersList from '@/components/users-list'

const USERS_PER_PAGE = 30

interface UsersPageProps {
    usersList: User[]
    usersCount: number
    currentPage: number
}

const UsersPage: NextPage<UsersPageProps> = ({
    usersList,
    usersCount,
    currentPage
}) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'pages.users'
    })

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const title = useMemo(() => {
        const titlePage =
            currentPage && currentPage > 1
                ? ` - ${t('titlePage')} ${currentPage}`
                : ''

        return t('title') + titlePage
    }, [currentPage, i18n.language])

    return (
        <AppLayout>
            <NextSeo
                title={title}
                description={`${title} - ${usersList
                    ?.map(({ name }) => name)
                    .join(', ')
                    .substring(0, 160)}`}
                canonical={`${canonicalUrl}users${
                    currentPage && currentPage > 1 ? '?page=' + currentPage : ''
                }`}
            />

            <Header
                title={title}
                currentPage={t('breadCrumbCurrent')}
            />

            <UsersList users={usersList} />

            <Container className={'pagination'}>
                <div>
                    {t('usersCount')} <strong>{usersCount}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItemsCount={usersCount}
                    perPage={USERS_PER_PAGE}
                    linkPart={'users'}
                />
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<UsersPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const currentPage = parseInt(context.query.page as string, 10) || 1

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            const { data: usersList } = await store.dispatch(
                API.endpoints?.usersGetList.initiate({
                    limit: USERS_PER_PAGE,
                    offset: (currentPage - 1) * USERS_PER_PAGE
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    currentPage,
                    usersCount: usersList?.count || 0,
                    usersList: usersList?.items || []
                }
            }
        }
)

export default UsersPage
