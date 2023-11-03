import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'

interface StatisticLineProps {
    title: string
    hide?: boolean
    last?: boolean
    icon?: React.ReactNode
    content?: React.ReactNode | string | number
}

const StatisticLine: React.FC<StatisticLineProps> = ({
    icon,
    hide,
    last,
    title,
    content
}) =>
    hide ? (
        <></>
    ) : (
        <Stack
            direction={'row'}
            spacing={1}
            sx={{ mb: !last ? 1 : 0 }}
        >
            {icon}
            <Typography
                color={'#616161'}
                variant={'body1'}
            >
                {title}
            </Typography>
            {typeof content === 'string' || typeof content === 'number' ? (
                <Typography variant={'body1'}>
                    {content ?? <div>{'---'}</div>}
                </Typography>
            ) : (
                content
            )}
        </Stack>
    )

export default StatisticLine
