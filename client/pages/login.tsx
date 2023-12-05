import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'

import LoginForm from '@/components/login-form'
import LoginGoogle from '@/components/login-google'
import PageLayout from '@/components/page-layout'

const PAGE_TITLE = 'Авторизация'

const MapPage: NextPage = () => {
    return (
        <PageLayout>
            <NextSeo title={PAGE_TITLE} />
            <LoginForm />

            <LoginGoogle />
        </PageLayout>
    )
}

export default MapPage
