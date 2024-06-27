import React, { useEffect, useState } from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { LOCAL_STORAGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import * as LocalStorage from '@/functions/localstorage'
import ScreenSpinner from '@/ui/screen-spinner'

interface AuthPageProps {}

const AuthPage: NextPage<AuthPageProps> = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [returnPath] = useLocalStorage<string>(LOCAL_STORAGE.RETURN_PATH)

    const { t } = useTranslation('common', {
        keyPrefix: 'pages.auth'
    })

    const service = searchParams.get('service')
    const code = searchParams.get('code')

    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [serviceLogin, { data }] = API.useAuthLoginServiceMutation()

    useEffect(() => {
        if (isAuth) {
            router.push('/')
        }
    })

    useEffect(() => {
        if (data?.auth === true && !isProcessing) {
            setIsProcessing(true)
            dispatch(login(data))

            if (returnPath) {
                const returnLink = returnPath

                LocalStorage.removeItem(LOCAL_STORAGE.RETURN_PATH as any)

                router.push(returnLink)
            } else {
                router.push('/')
            }
        }
    }, [data])

    useEffect(() => {
        if (code && service) {
            serviceLogin({
                code,
                service: service as ApiTypes.AuthServiceType
            })
        } else {
            router.push('/')
        }
    }, [])

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
