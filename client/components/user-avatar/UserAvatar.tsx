import { Avatar } from '@mui/material'
import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import React, { useState } from 'react'

import { ImageHost } from '@/api/api'
import { User } from '@/api/types/User'

import userAvatar from '@/public/images/no-avatar.jpeg'

type SizeType = 'small' | 'medium'

interface AvatarProps {
    user?: User
    size?: SizeType
    text?: string | React.ReactNode
    loading?: boolean
}

const POPOVER_ID = 'user-avatar'

const getDimension = (size?: SizeType) => (size === 'medium' ? 34 : 20)

const UserAvatar: React.FC<AvatarProps> = ({ user, size, text, loading }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (user?.id) {
            setAnchorEl(event.currentTarget)
        }
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <Stack
                direction={'row'}
                spacing={1}
            >
                {loading ? (
                    <>
                        <Skeleton
                            variant={'rounded'}
                            sx={{
                                height: getDimension(size),
                                width: getDimension(size)
                            }}
                        />
                        <Skeleton
                            variant={'text'}
                            width={100}
                        />
                    </>
                ) : (
                    <>
                        <Avatar
                            alt={user?.name || ''}
                            src={
                                user?.avatar
                                    ? `${ImageHost}avatar/${user.avatar}`
                                    : userAvatar.src
                            }
                            sx={{
                                cursor: user?.avatar ? 'pointer' : 'default',
                                height: getDimension(size),
                                width: getDimension(size)
                            }}
                            variant={'rounded'}
                            onClick={handleClick}
                            aria-describedby={POPOVER_ID}
                        />
                        <div>
                            {user?.id ? (
                                <Link
                                    href={`/users/${user.id}`}
                                    title={user?.name}
                                >
                                    {user?.name}
                                </Link>
                            ) : (
                                <div>{user?.name || 'Гость'}</div>
                            )}
                            {text && (
                                <Typography
                                    variant={'caption'}
                                    sx={{
                                        color: '#818c99',
                                        display: 'block',
                                        mt: '-4px'
                                    }}
                                >
                                    {text}
                                </Typography>
                            )}
                        </div>
                    </>
                )}
            </Stack>
            <Popover
                id={POPOVER_ID}
                open={!!anchorEl && !!user?.id}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }}
                slotProps={{
                    paper: {
                        sx: {
                            border: '1px solid #edeef0',
                            boxShadow:
                                '0 0 2px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.08)'
                        }
                    }
                }}
            >
                <Box
                    sx={{
                        height: 150,
                        p: 1,
                        width: 300
                    }}
                ></Box>
            </Popover>
        </>
    )
}

export default UserAvatar
