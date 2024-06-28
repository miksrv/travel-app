import React, { useEffect } from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
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
            <Container style={{ margin: '5% auto', maxWidth: '500px', textAlign: 'center' }}>
                <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Отписка от рассылки</h1>
                {error && (
                    <Message
                        type={'negative'}
                        title={'Ошибка'}
                        text={error as string}
                    />
                )}
                {data && (
                    <Message
                        type={'positive'}
                        title={'Успешно!'}
                        text={data as string}
                    />
                )}
                <p>Отписка от рассылки уведомлений по электронной почты.</p>
                {isLoading && (
                    <div style={{ margin: '40px auto 20px', width: 100 }}>
                        <Spinner />
                    </div>
                )}
                {(isSuccess || isError) && <Link href={'/'}>Перейти на главную страницу</Link>}
            </Container>
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
