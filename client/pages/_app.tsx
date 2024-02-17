import '@/styles/globals.sass'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
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
            <div
                dangerouslySetInnerHTML={{
                    __html: '<!-- Yandex.Metrika counter --> <script type="text/javascript" > (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }} k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym"); ym(96500810, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true }); </script> <noscript><div><img src="https://mc.yandex.ru/watch/96500810" style="position:absolute; left:-9999px;" alt="" /></div></noscript> <!-- /Yandex.Metrika counter -->'
                }}
            />
        </>
    )
}

export default appWithTranslation(App)
