import React from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import UserAvatarGroup from '@/components/user-avatar-group'
import { levelImage } from '@/functions/userLevels'
import Container from '@/ui/container'

interface LevelsPageProps {
    levels: ApiTypes.ResponseLevelsGetList | null
}

const LevelsPage: NextPage<LevelsPageProps> = ({ levels }) => {
    const { t, i18n } = useTranslation()
    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    return (
        <AppLayout>
            <NextSeo
                title={t('user-levels')}
                canonical={`${canonicalUrl}users/levels`}
                description={t('user-levels-description-1')}
            />
            <Header
                title={t('user-levels')}
                homePageTitle={t('news-feed')}
                currentPage={t('user-levels')}
                links={[
                    {
                        link: '/users/',
                        text: t('users')
                    }
                ]}
            />

            <Container>
                <p>{t('user-levels-description-1')}</p>
                <p>{t('user-levels-description-2')}</p>
                <h2 style={{ marginBottom: '5px' }}>{t('how-much-experience-for-actions')}</h2>
                <ul className={'normal'}>
                    {levels?.awards &&
                        Object.entries(levels.awards).map(([key, value]) => (
                            <li key={key}>
                                {t(`action_${key}`)}
                                {': '}
                                <strong>{`+${value}`}</strong> {t('experience')}
                            </li>
                        ))}
                </ul>
            </Container>

            <Container className={'levelsPage'}>
                {levels?.items?.map((level) => (
                    <div
                        key={`level${level.level}`}
                        className={'levelContainer'}
                    >
                        <div>
                            <div className={'levelTitle'}>
                                {t('level_num', { level: level.level })}
                                <Image
                                    src={levelImage(level.level).src}
                                    alt={''}
                                    width={26}
                                    height={26}
                                />
                                {level.title}
                            </div>
                            <div className={'experience'}>
                                {t('need-experience_num', { experience: level.experience })}
                            </div>
                        </div>
                        <UserAvatarGroup
                            users={level.users}
                            totalCount={level.users?.length && level.count ? level.count - level.users.length : 0}
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

            const { data } = await store.dispatch(API.endpoints.levelsGetList.initiate())

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
