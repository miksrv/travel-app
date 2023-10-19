import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'

interface StatisticLineProps {
    title: string
    icon?: React.ReactNode
    text?: React.ReactNode
    last?: boolean
}

const StatisticLine: React.FC<StatisticLineProps> = ({
    icon,
    title,
    text,
    last
}) => (
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
        <Typography variant={'body1'}>{text || '-'}</Typography>
    </Stack>
)

export default StatisticLine
