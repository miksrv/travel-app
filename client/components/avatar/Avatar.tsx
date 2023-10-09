import { Avatar as MuiAvatar } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'

import { ImageHost } from '@/api/api'

type SizeType = 'small' | 'medium'

interface AvatarProps {
    size?: SizeType
    userName?: string
    text?: string
    image?: string
    loading?: boolean
}

const getDimension = (size?: SizeType) => (size === 'medium' ? 32 : 20)

const Avatar: React.FC<AvatarProps> = ({
    size,
    userName,
    text,
    image,
    loading
}) => (
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
                {!userName && !image && <div>-</div>}
                {image && (
                    <MuiAvatar
                        alt={userName || ''}
                        src={`${ImageHost}/avatars/${image}` || undefined}
                        sx={{
                            height: getDimension(size),
                            width: getDimension(size)
                        }}
                        variant={'rounded'}
                    />
                )}
                <div>
                    {userName && <div>{userName}</div>}
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
)

export default Avatar
