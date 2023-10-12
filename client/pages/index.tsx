import { Button, Card } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import { NextPage } from 'next'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { API } from '@/api/api'

import Avatar from '@/components/avatar'
import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'

import { formatDate } from '@/functions/helpers'

const Main: NextPage = () => {
    const { t } = useTranslation('common')

    const { data, isLoading } = API.useActivityGetListQuery()

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
                    sx={{ mb: -0.5, mt: -0.5 }}
                />
            </Card>
            {data?.items?.map((item, index) => (
                <Card
                    key={index}
                    sx={{ mb: 1 }}
                >
                    <CardContent>
                        <Avatar
                            size={'medium'}
                            userName={item.author?.name}
                            image={item.author?.avatar}
                            text={formatDate(item.created?.date)}
                        />
                    </CardContent>
                </Card>
            ))}
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default Main
