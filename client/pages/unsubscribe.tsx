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

    const { t } = useTranslation('common', {
        keyPrefix: 'pages.unsubscribe'
    })

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
                title={t('title')}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <div style={{ width: '500px', textAlign: 'center' }}>
                    <Container>
                        <h1 style={{ textAlign: 'center', marginBottom: 20, fontSize: '20px' }}>{t('title')}</h1>
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
                        <p style={{ color: '#818c99' }}>{t('description')}</p>
                        {isLoading && (
                            <div style={{ margin: '40px auto 20px', width: 100 }}>
                                <Spinner />
                            </div>
                        )}
                        {(isSuccess || isError) && (
                            <Button
                                link={'/'}
                                size={'medium'}
                                mode={'primary'}
                            >
                                {t('linkToMainPage')}
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
