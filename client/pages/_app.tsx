import '@/styles/globals.sass'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import 'react-image-lightbox/style.css'
import { Provider } from 'react-redux'

import { wrapper } from '@/api/store'

export const SITE_NAME = 'Название сайта'

const App = ({ Component, pageProps }: AppProps) => {
    const { i18n } = useTranslation()
    const { store } = wrapper.useWrappedStore(pageProps)

    dayjs.extend(utc)
    dayjs.extend(relativeTime)
    dayjs.locale(i18n?.language ?? 'ru')

    return (
        <>
            <Head>
                <meta
                    name={'viewport'}
                    content={
                        'width=device-width, initial-scale=1, shrink-to-fit=no'
                    }
                />
                <link
                    rel={'shortcut icon'}
                    href={'/favicon.png'}
                    key={'shortcutIcon'}
                />
            </Head>
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        </>
    )
}

export default appWithTranslation(App)
