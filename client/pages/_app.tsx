import { AppProps } from 'next/app'
import { Montserrat } from 'next/font/google'
import Head from 'next/head'

const montserrat = Montserrat({ subsets: ['latin'] })

const App = ({ Component, pageProps }: AppProps) => (
    <>
        <Head>
            <meta
                name='viewport'
                content='width=device-width, initial-scale=1, shrink-to-fit=no'
            />
            <link
                rel='shortcut icon'
                href='/favicon.png'
                key='shortcutIcon'
            />
            <link
                rel='manifest'
                href='/manifest.json'
            />
        </Head>
        <main className={montserrat.className}>
            <Component {...pageProps} />
        </main>
    </>
)

export default App
