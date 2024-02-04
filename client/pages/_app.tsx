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

// https://vkcom.github.io/VKUI/#/SplitLayout
// https://vkcom.github.io/VKUI/6.0.0-beta.3/#/RichCell
// https://setproduct.com/material-x
// https://www.atlasobscura.com/places/tunguska-event-epicenter
// https://www.tursar.ru/page-dop.php?c=1
// https://account.travel/things-to-do/california
// https://www.earthcam.com/mapsearch/
// https://github.com/sekoyo/react-image-crop?tab=readme-ov-file#example

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
