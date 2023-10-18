import { Avatar } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import { skipToken } from '@reduxjs/toolkit/query'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import React from 'react'

import { API, ImageHost } from '@/api/api'
import { wrapper } from '@/api/store'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'

import userAvatar from '@/public/images/no-avatar.jpeg'

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<any>> => {
            const name = context.params?.name

            if (typeof name === 'string') {
                const data: any = await store.dispatch(
                    API.endpoints.usersGetItem.initiate(name)
                )

                await Promise.all(
                    store.dispatch(API.util?.getRunningQueriesThunk())
                )

                if (data.error?.originalStatus === 404) {
                    return { notFound: true }
                }

                return { props: { data } }
            }

            return { notFound: true }
        }
)

const UserItemPage: NextPage = () => {
    const router = useRouter()
    const routerId = router.query.name
    const userId = typeof routerId === 'string' ? routerId : skipToken

    const { data, isLoading } = API.useUsersGetItemQuery(
        typeof userId === 'string' ? userId : '',
        {
            skip: router.isFallback || !routerId
        }
    )

    return (
        <PageLayout>
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={
                        isLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'40%'}
                            />
                        ) : (
                            data?.name
                        )
                    }
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        isLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'70%'}
                            />
                        ) : (
                            <Breadcrumbs
                                currentPage={data?.name}
                                links={[
                                    {
                                        link: '/users/',
                                        text: 'Путешественники'
                                    }
                                ]}
                            />
                        )
                    }
                    sx={{ mb: -1, mt: -1 }}
                />
                <Divider />
                <CardContent>
                    <Avatar
                        alt={data?.name || ''}
                        src={
                            data?.avatar
                                ? `${ImageHost}avatar/${data.avatar}`
                                : userAvatar.src
                        }
                        sx={{
                            height: 128,
                            width: 128
                        }}
                        variant={'rounded'}
                    />
                </CardContent>
            </Card>
        </PageLayout>
    )
}

// export default connect((state: RootState) => state)(PlacePage)
export default UserItemPage
