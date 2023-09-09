import '@/styles/globals.sass'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import { green, lightGreen } from '@mui/material/colors'
import { ruRU } from '@mui/material/locale'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AppProps } from 'next/app'
import { Montserrat } from 'next/font/google'
import Head from 'next/head'
import { Provider } from 'react-redux'

import { wrapper } from '@/api/store'

import Header from '@/components/header'

const montserrat = Montserrat({ subsets: ['latin'] })

const theme = createTheme(
    {
        components: {
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 3
                    }
                }
            }
        },
        palette: {
            mode: 'light',
            primary: green,
            secondary: lightGreen
        },
        typography: {
            fontSize: 12,
            h1: {
                fontSize: 24
            },
            h3: {
                fontSize: 14
            }
        }
    },
    ruRU
)

const App = ({ Component, pageProps }: AppProps) => {
    const { store, props } = wrapper.useWrappedStore(pageProps)

    return (
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
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Container
                        component='main'
                        maxWidth='lg'
                        className={montserrat.className}
                    >
                        {/*<Header />*/}
                        <Component {...props.pageProps} />
                    </Container>
                </ThemeProvider>
            </Provider>
        </>
    )
}

export default App
