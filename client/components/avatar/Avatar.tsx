import { Avatar as MuiAvatar } from '@mui/material'
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
}

const getDimension = (size?: SizeType) => (size === 'medium' ? 32 : 20)

const Avatar: React.FC<AvatarProps> = ({ size, userName, text, image }) => (
    <Stack
        direction={'row'}
        spacing={1}
    >
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
    </Stack>
)

export default Avatar
