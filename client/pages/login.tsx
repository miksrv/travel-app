import Container from '@mui/material/Container'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'

import LoginForm from '@/components/login-form'
import LoginGoogle from '@/components/login-google'

const PAGE_TITLE = 'Авторизация'

const LoginPage: NextPage = () => {
    return (
        <Container
            component={'main'}
            maxWidth={false}
            sx={{ maxWidth: '1100px' }}
        >
            <NextSeo title={PAGE_TITLE} />
            <LoginForm />

            <LoginGoogle />
        </Container>
    )
}

export default LoginPage
