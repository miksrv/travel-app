import '@/styles/globals.sass'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import utc from 'dayjs/plugin/utc'
import { useTranslation } from 'next-i18next'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import 'react-image-lightbox/style.css'
import { Provider } from 'react-redux'

import { wrapper } from '@/api/store'

import AppAuthChecker from '@/components/app-auth-checker'

// https://vkcom.github.io/VKUI/#/SplitLayout
// https://vkcom.github.io/VKUI/6.0.0-beta.3/#/RichCell
// https://setproduct.com/material-x
// https://www.atlasobscura.com/places/tunguska-event-epicenter
// https://account.travel/things-to-do/california
// https://dtf.ru/life/2419947-dvachery-doveli-do-suicida-eshe-odnogo-niderlandah-sovershil-suicid-anton-babkin-antonina-babkina
// https://www.earthcam.com/mapsearch/

export const SITE_NAME = 'Название сайта'

const App = ({ Component, pageProps }: AppProps) => {
    const { i18n } = useTranslation()
    const { store } = wrapper.useWrappedStore(pageProps)

    dayjs.extend(utc)
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
                <AppAuthChecker />
                <Component {...pageProps} />
            </Provider>
        </>
    )
}

export default appWithTranslation(App)
