import React, { useEffect } from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import Button from '@/ui/button'
import Container from '@/ui/container'
import Message from '@/ui/message'
import Spinner from '@/ui/spinner'

interface UnsubscribePageProps {}

const UnsubscribePage: NextPage<UnsubscribePageProps> = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useTranslation()

    const mailId = searchParams.get('mail')

    const { data, error, isLoading, isSuccess, isError } = API.useMailGetUnsubscribeQuery(mailId || '', {
        skip: !mailId
    })

    useEffect(() => {
        if (!mailId) {
            router.push('/')
        }
    }, [])

    return (
        <>
            <NextSeo
                nofollow={true}
                noindex={true}
                title={t('unsubscribe-from-email-notifications')}
            />
            <div className={'centerPageContainer'}>
                <div className={'wrapper'}>
                    <Container>
                        <h1 className={'header'}>{t('unsubscribe-from-email-notifications')}</h1>
                        {error && (
                            <Message
                                type={'negative'}
                                title={t('error')}
                                text={error as string}
                            />
                        )}
                        {data && (
                            <Message
                                type={'positive'}
                                title={t('success')}
                                text={data as string}
                            />
                        )}
                        <p className={'description'}>{t('unsubscribe-from-email-notifications-description')}</p>
                        {isLoading && (
                            <div className={'loaderWrapper'}>
                                <Spinner />
                            </div>
                        )}
                        {(isSuccess || isError) && (
                            <Button
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
        async (context): Promise<GetServerSidePropsResult<UnsubscribePageProps>> => {
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

export default UnsubscribePage
