import '@/styles/globals.sass'
import CssBaseline from '@mui/material/CssBaseline'
import { ruRU } from '@mui/material/locale'
import { Shadows, ThemeProvider, createTheme } from '@mui/material/styles'
import { AppProps } from 'next/app'
import Head from 'next/head'
import NextLink from 'next/link'
import { forwardRef } from 'react'
import { Provider } from 'react-redux'

import { wrapper } from '@/api/store'

// https://vkcom.github.io/VKUI/#/SplitLayout
// https://setproduct.com/material-x
// https://www.atlasobscura.com/places/tunguska-event-epicenter

const LinkBehaviour = forwardRef(function LinkBehaviour(props, ref) {
    return (
        <NextLink
            // @ts-ignore
            ref={ref}
            {...props}
        />
    )
})

const theme = createTheme(
    {
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#FFF',
                        color: '#000'
                    }
                }
            },
            MuiBreadcrumbs: {
                styleOverrides: {
                    root: {
                        fontSize: 12
                    }
                }
            },
            MuiButtonBase: {
                defaultProps: {
                    LinkComponent: LinkBehaviour
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
            },
            MuiLink: {
                defaultProps: {
                    component: LinkBehaviour
                }
            },
            MuiTypography: {
                variants: [
                    {
                        props: { variant: 'body2' },
                        style: {
                            fontWeight: 300
                        }
                    }
                ]
            }
        },
        palette: {
            mode: 'light'
        },
        // shadows: ['none'] as unknown as Shadows,
        shadows: [
            'none',
            '1px 1px 1px 0 rgba(0, 0, 0, 0.1)',
            '0px 2px 2px 0px rgba(0, 0, 0, 0.25)',
            '0px 6px 8px 0px rgba(0, 0, 0, 0.25)',
            '0px 15px 52px 15px rgba(50, 59, 82, 0.15)',
            ...Array(20).fill('none')
        ] as unknown as Shadows,
        typography: {
            fontFamily:
                '-apple-system,system-ui,"Helvetica Neue",Roboto,sans-serif',
            fontSize: 14,
            h1: {
                fontSize: 24,
                fontWeight: 600,
                lineHeight: '28px'
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
