import { Pagination } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import React, { useState } from 'react'

import { API } from '@/api/api'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import UserAvatar from '@/components/user-avatar'

import { formatDate } from '@/functions/helpers'
import { encodeQueryData } from '@/functions/helpers'

const USERS_PER_PAGE = 30

const UsersPage: NextPage = () => {
    const router = useRouter()

    const [page, setPage] = useState<number>(1)

    const { data } = API.useUsersGetListQuery({
        limit: USERS_PER_PAGE,
        offset: ((Number(page) || 1) - 1) * USERS_PER_PAGE
    })

    useEffect(() => {
        const urlParams = {
            page: page !== 1 ? page : undefined
        }

        router.push(`users${encodeQueryData(urlParams)}`, undefined, {
            shallow: true
        })
    }, [page])

    const nextLevelPercentage = (
        currentExperience: number,
        experienceToNextLevel: number
    ): number => {
        if (currentExperience < 0 || experienceToNextLevel <= 0) {
            return 0
        }

        return Math.min(100, (currentExperience / experienceToNextLevel) * 100)
    }

    return (
        <PageLayout maxWidth={'lg'}>
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={'Путешественники'}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        <Breadcrumbs currentPage={'Список путешественников'} />
                    }
                    sx={{ mb: -1, mt: -1 }}
                />
            </Card>

            {data?.items?.length ? (
                <Card sx={{ mb: 2, mt: 2 }}>
                    <CardContent sx={{ m: -1.5, mb: -2.5 }}>
                        <List>
                            {data.items.map((user, key) => (
                                <ListItem
                                    key={key}
                                    divider={
                                        key !== (data.items?.length || 1) - 1
                                    }
                                >
                                    <Stack
                                        direction={'row'}
                                        spacing={2}
                                    >
                                        <Box sx={{ minWidth: '230px' }}>
                                            <UserAvatar
                                                user={user}
                                                size={'medium'}
                                                text={formatDate(
                                                    user?.created?.date
                                                )}
                                            />
                                        </Box>
                                        <div>
                                            {`${user?.level?.name} (${user?.level?.level})`}
                                            <LinearProgress
                                                variant={'determinate'}
                                                value={nextLevelPercentage(
                                                    user?.level?.experience ||
                                                        0,
                                                    user?.level?.nextLevel ||
                                                        user?.level
                                                            ?.experience ||
                                                        0
                                                )}
                                            />
                                        </div>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            ) : (
                <div>{'Нет фотографий'}</div>
            )}

            <Pagination
                sx={{ mt: 2 }}
                shape={'rounded'}
                page={page}
                hidden={!data?.count}
                count={Math.ceil((data?.count || 0) / USERS_PER_PAGE)}
                onChange={(_, page) => setPage(page)}
            />
        </PageLayout>
    )
}

export default UsersPage
