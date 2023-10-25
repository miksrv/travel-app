import { Card } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { NextPage } from 'next'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Gallery from 'react-photo-gallery'

import { API, ImageHost } from '@/api/api'
import { ActivityTypes } from '@/api/types/Activity'

import ActivityList from '@/components/activity-list'
import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import UserAvatar from '@/components/user-avatar'

import { categoryImage } from '@/functions/categories'
import { formatDate } from '@/functions/helpers'

const MainPage: NextPage = () => {
    const [lastDate, setLastDate] = useState<string>()
    const { t } = useTranslation('common')

    const { data, isFetching } = API.useActivityGetListQuery({
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
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={t('title', 'Лента активности')}
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
