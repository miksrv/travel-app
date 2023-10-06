import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'

interface StatisticLineProps {
    title: string
    icon?: React.ReactNode
    text?: React.ReactNode
}

const StatisticLine: React.FC<StatisticLineProps> = ({ icon, title, text }) => (
    <Stack
        direction={'row'}
        spacing={1}
        sx={{ mb: 0.6 }}
    >
        {icon}
        <Typography
            sx={{ color: '#818c99', width: 140 }}
            variant={'body1'}
        >
            {title}
        </Typography>
        <Typography variant={'body1'}>{text || '-'}</Typography>
    </Stack>
)

export default StatisticLine
