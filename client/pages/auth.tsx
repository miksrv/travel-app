import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

import ScreenSpinner from '@/ui/screen-spinner'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import * as LocalStorage from '@/functions/localstorage'
import { LOCAL_STORAGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'

interface AuthPageProps {}

const AuthPage: NextPage<AuthPageProps> = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [returnPath] = useLocalStorage<string>(LOCAL_STORAGE.RETURN_PATH)

    const { t } = useTranslation('common', {
        keyPrefix: 'pages.auth'
    })

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [serviceLogin, { data }] = API.useAuthLoginServiceMutation()

    useEffect(() => {
        if (isAuth) {
            router.push('/')
        }
    })

    useEffect(() => {
        if (data?.auth === true) {
            dispatch(login(data))

            if (returnPath) {
                const returnLink = returnPath

                LocalStorage.removeItem('RETURN_PATH')

                router.push(returnLink)
            } else {
                router.push('/')
            }
        }
    }, [data])

    useEffect(() => {
        const service = searchParams.get('service') as ApiTypes.AuthServiceType
        const code = searchParams.get('code')

        if (code && service) {
            serviceLogin({ code, service })
        } else {
            router.push('/')
        }
    }, [searchParams])

    return (
        <>
            <NextSeo
                nofollow={true}
                noindex={true}
                title={t('title')}
            />
            <ScreenSpinner text={t('pleaseWait')} />
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<AuthPageProps>> => {
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

export default AuthPage
