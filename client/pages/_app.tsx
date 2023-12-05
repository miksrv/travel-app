import '@/styles/globals.sass'
import CssBaseline from '@mui/material/CssBaseline'
import InputBase from '@mui/material/InputBase'
import { ruRU } from '@mui/material/locale'
import {
    Shadows,
    ThemeProvider,
    alpha,
    createTheme,
    styled
} from '@mui/material/styles'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import NextLink from 'next/link'
import { forwardRef } from 'react'
import 'react-image-lightbox/style.css'
import { Provider } from 'react-redux'

import { wrapper } from '@/api/store'

// https://vkcom.github.io/VKUI/#/SplitLayout
// https://setproduct.com/material-x
// https://www.atlasobscura.com/places/tunguska-event-epicenter
// https://account.travel/things-to-do/california

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
                        borderBottom: '1px solid rgba(0,0,0,.12)',
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
                        backgroundColor: 'transparent', // #f7f8fa
                        // borderColor: 'rgba(0,0,0,.08)',
                        // borderRadius: 4,
                        border: 'none',
                        color: '#616161',
                        fontSize: 12,
                        fontWeight: 500,
                        padding: 0
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
            MuiListItemText: {
                styleOverrides: {
                    root: {
                        fontSize: 14
                    }
                }
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        fontSize: 14
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        fontSize: 12,
                        minHeight: 24,
                        padding: '12px 20px',
                        textTransform: 'none'
                    }
                }
            },
            MuiTabs: {
                styleOverrides: {
                    root: {
                        minHeight: 30
                    }
                }
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        fontSize: 14
                    }
                }
            },
            MuiTypography: {
                variants: [
                    {
                        props: { variant: 'body2' },
                        style: {
                            fontWeight: 400
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
            '0 0 0 1px rgba(0,0,0,.12)',
            '0 1px 2px rgba(0,0,0,.1)',
            '1px 1px 1px 0 rgba(0, 0, 0, 0.1)',
            '0 0 2px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.08)',
            '0px 6px 8px 0px rgba(0, 0, 0, 0.25)',
            ...Array(19).fill('none')
        ] as unknown as Shadows,
        typography: {
            body1: {
                fontSize: 13
            },
            body2: {
                fontSize: 14
            },
            caption: {
                fontSize: 12
            },
            fontFamily:
                '-apple-system,system-ui,"Helvetica Neue",Roboto,sans-serif',
            fontSize: 12,
            h1: {
                fontSize: 24,
                fontWeight: 600,
                lineHeight: '28px'
            },
            h2: {
                fontSize: 19,
                fontWeight: 600,
                lineHeight: '24px'
            },
            h3: {
                fontSize: 14,
                fontWeight: 500
            }
        }
    },
    ruRU
)

export const InputField = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        '&:focus': {
            borderColor: theme.palette.primary.main,
            boxShadow: `${alpha(
                theme.palette.primary.main,
                0.25
            )} 0 0 0 0.05rem`
        },
        backgroundColor: theme.palette.mode === 'light' ? '#f7f8fa' : '#1A2027',
        border: '1px solid',
        borderColor: theme.palette.mode === 'light' ? '#cbcccd' : '#2D3843',
        borderRadius: 6,
        borderWidth: 0.5,
        fontSize: 14,
        padding: '8px 12px',
        position: 'relative',
        transition: theme.transitions.create([
            'border-color',
            'background-color',
            'box-shadow'
        ])
    },
    'label + &': {
        marginTop: theme.spacing(2.5)
    }
}))

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

export default appWithTranslation(App)
