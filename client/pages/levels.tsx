import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import React from 'react'

import Container from '@/ui/container'

import { API, SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import UserAvatar from '@/components/user-avatar'
import UserAvatarGroup from '@/components/user-avatar-group'

import { levelImage } from '@/functions/userLevels'

interface LevelsPageProps {
    levels: ApiTypes.ResponseLevelsGetList | null
}

const LevelsPage: NextPage<LevelsPageProps> = ({ levels }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'pages.levels'
    })

    return (
        <AppLayout>
            <NextSeo
                title={''}
                canonical={`${SITE_LINK}${
                    i18n.language === 'en' ? 'en/' : ''
                }levels`}
            />
            <Header
                title={''}
                currentPage={t('breadCrumbCurrent')}
            />

            <Container className={'levelsPage'}>
                {levels?.items?.map((level) => (
                    <div
                        key={`level${level.level}`}
                        className={'levelContainer'}
                    >
                        <div className={'levelTitle'}>
                            Уровень {level.level}
                            <Image
                                src={levelImage(level.level)?.src}
                                alt={''}
                                width={26}
                                height={26}
                            />
                            {level.title}
                        </div>
                        <div className={'experience'}>
                            Нужно опыта: {level.experience}
                        </div>
                        <UserAvatarGroup
                            users={level.users}
                            totalCount={
                                level.users?.length && level.count
                                    ? level.count - level.users?.length
                                    : 0
                            }
                        />
                    </div>
                ))}
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<LevelsPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            const { data } = await store.dispatch(
                API.endpoints?.levelsGetList.initiate()
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    levels: data ?? null
                }
            }
        }
)

export default LevelsPage
