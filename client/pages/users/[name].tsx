import { ImageOutlined, PlaceOutlined } from '@mui/icons-material'
import { Avatar } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
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

    const [activeTab, setActiveTab] = React.useState<number>(0)

    const { data, isLoading } = API.useUsersGetItemQuery(
        typeof userId === 'string' ? userId : '',
        {
            skip: router.isFallback || !routerId
        }
    )

    const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
        setActiveTab(newTab)
    }

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

            <Card sx={{ mb: 2 }}>
                <CardHeader
                    sx={{ p: 0 }}
                    title={
                        <Tabs
                            defaultValue={0}
                            value={activeTab}
                            tabIndex={activeTab}
                            onChange={handleTabChange}
                            aria-label={'basic tabs'}
                        >
                            <Tab
                                label={'Места (23)'}
                                icon={<PlaceOutlined />}
                                iconPosition={'start'}
                            />
                            <Tab
                                label={'Фотографии (12)'}
                                icon={<ImageOutlined />}
                                iconPosition={'start'}
                            />
                        </Tabs>
                    }
                />
                <Divider />
                <CardContent>sss</CardContent>
            </Card>
        </PageLayout>
    )
}

// export default connect((state: RootState) => state)(PlacePage)
export default UserItemPage
