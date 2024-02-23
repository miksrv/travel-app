import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect } from 'react'

import Container from '@/ui/container'

import { SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import LoginForm from '@/components/login-form'

interface LoginPageProps {}

const LoginPage: NextPage<LoginPageProps> = () => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'pages.login'
    })

    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const handleSuccessLogin = async () => {
        await router.push('/')
    }

    useEffect(() => {
        if (authSlice.isAuth) {
            router.push('/')
        }
    })

    return (
        <Container className={'loginPage'}>
            <NextSeo
                nofollow={true}
                noindex={true}
                title={t('title')}
                description={t('title')}
                canonical={`${SITE_LINK}${
                    i18n.language === 'en' ? 'en/' : ''
                }login`}
            />
            <LoginForm onSuccessLogin={handleSuccessLogin} />
        </Container>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<LoginPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default LoginPage
