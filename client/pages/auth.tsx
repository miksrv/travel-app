import React, { useEffect, useState } from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { Button, Container, Message, Spinner } from 'simple-react-ui-kit'

import { API, ApiType, useAppDispatch, useAppSelector } from '@/api'
import { setLocale } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { wrapper } from '@/api/store'
import { LOCAL_STORAGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import * as LocalStorage from '@/functions/localstorage'

type AuthPageProps = object

const AuthPage: NextPage<AuthPageProps> = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useTranslation()
    const [returnPath] = useLocalStorage<string>(LOCAL_STORAGE.RETURN_PATH)

    const service = searchParams.get('service')
    const code = searchParams.get('code')

    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [serviceLogin, { data, error, isLoading, isError, isSuccess }] = API.useAuthLoginServiceMutation()

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
                service: service as ApiType.AuthService,
                state: searchParams.get('state') ?? undefined,
                device_id: searchParams.get('device_id') ?? undefined
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
                title={t('authorization-on-site')}
            />
            <div className={'centerPageContainer'}>
                <div className={'wrapper'}>
                    <Container>
                        <h1 className={'header'}>{t('authorization-on-site')}</h1>
                        {error && (
                            <Message
                                type={'error'}
                                title={t('notification_error')}
                            >
                                {error as string}
                            </Message>
                        )}
                        {(isLoading || isSuccess) && (
                            <div className={'loaderWrapper'}>
                                <Spinner />
                            </div>
                        )}
                        {isError && (
                            <Button
                                style={{ marginTop: 20 }}
                                link={'/'}
                                size={'medium'}
                                mode={'primary'}
                            >
                                {t('go-to-home-page')}
                            </Button>
                        )}
                    </Container>
                </div>
            </div>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<AuthPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiType.Locale
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
