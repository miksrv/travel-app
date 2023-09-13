import '@/styles/globals.sass'
import CssBaseline from '@mui/material/CssBaseline'
import { ruRU } from '@mui/material/locale'
import { Shadows, ThemeProvider, createTheme } from '@mui/material/styles'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'

import { wrapper } from '@/api/store'

const theme = createTheme(
    {
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#FFF'
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#f7f8fa',
                        borderColor: 'rgba(0,0,0,.08)',
                        borderRadius: 4,
                        fontSize: 12,
                        paddingLeft: 4
                    }
                }
            },
            MuiIcon: {
                styleOverrides: {
                    root: {
                        color: '#99a2ad'
                    }
                }
            }
        },
        palette: {
            mode: 'light'
        },
        shadows: ['none'] as unknown as Shadows,
        typography: {
            fontFamily:
                '-apple-system,system-ui,"Helvetica Neue",Roboto,sans-serif',
            fontSize: 14,
            h1: {
                fontSize: 24
            },
            h3: {
                fontSize: 16,
                fontWeight: 600
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
                    <Component {...props.pageProps} />
                </ThemeProvider>
            </Provider>
        </>
    )
}

export default App
