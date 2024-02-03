import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API } from '@/api/api'
import { wrapper } from '@/api/store'
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
    const { t } = useTranslation('common', {
        keyPrefix: 'pages.users'
    })

    return (
        <AppLayout>
            <NextSeo title={t('title')} />
            <Header
                title={t('title')}
                currentPage={t('breadCrumbCurrent')}
            />

            <UsersList users={usersList} />

            <Container className={'pagination'}>
                <div>
                    {t('usersCount')} <strong>{usersCount}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPostCount={usersCount}
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
            const locale = context.locale ?? 'ru'

            const currentPage = parseInt(context.query.page as string, 10) || 1

            const translations = await serverSideTranslations(locale)

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
