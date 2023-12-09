import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Unstable_Grid2'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import React from 'react'

import LoginForm from '@/components/login-form'
import LoginGoogle from '@/components/login-google'

const PAGE_TITLE = 'Авторизация'

const LoginPage: NextPage = () => {
    return (
        <Container
            component={'main'}
            maxWidth={'sm'}
        >
            <NextSeo title={PAGE_TITLE} />
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: 8
                }}
            >
                <Card
                    noValidate={true}
                    component={'form'}
                    sx={{ mt: 1 }}
                >
                    <CardContent>
                        <LoginForm />
                        <LoginGoogle />
                        <Divider sx={{ mb: 2, mt: 2 }} />
                        <Grid container>
                            <Grid xs>
                                <Link
                                    href={'#'}
                                    title={''}
                                >
                                    {'Забыли пароль?'}
                                </Link>
                            </Grid>
                            <Grid>
                                <Link
                                    href={'#'}
                                    title={''}
                                >
                                    {'Зарегистрироваться'}
                                </Link>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    )
}

export default LoginPage
