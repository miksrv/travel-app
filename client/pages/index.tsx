import { Card } from '@mui/material'
import CardHeader from '@mui/material/CardHeader'
import { NextPage } from 'next'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'

import { API } from '@/api/api'

import ActivityList from '@/components/activity-list'
import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'

const PAGE_TITLE = 'Лента активности'

const MainPage: NextPage = () => {
    const [lastDate, setLastDate] = useState<string>()
    const { t } = useTranslation('common')

    const { data, isFetching } = API.useActivityGetInfinityListQuery({
        date: lastDate
    })

    useEffect(() => {
        const onScroll = () => {
            const scrolledToBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 20

            if (scrolledToBottom && !isFetching && !!data?.items?.length) {
                setLastDate(data.items[data.items?.length - 1].created?.date)
            }
        }

        document.addEventListener('scroll', onScroll)

        return function () {
            document.removeEventListener('scroll', onScroll)
        }
    }, [lastDate, isFetching, data])

    return (
        <PageLayout>
            <NextSeo title={PAGE_TITLE} />
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={t('title', PAGE_TITLE)}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        <Breadcrumbs
                            currentPage={'Лента активности пользователей'}
                            hideHomePage={true}
                        />
                    }
                    sx={{ mb: -1, mt: -1 }}
                />
            </Card>
            <ActivityList activities={data?.items} />
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default MainPage
