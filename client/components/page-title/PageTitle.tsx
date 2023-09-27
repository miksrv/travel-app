import Typography from '@mui/material/Typography'
import React from 'react'

interface PageTitleProps {
    title: string
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => (
    <Typography
        variant='h1'
        sx={{ m: 0 }}
    >
        {title}
    </Typography>
)

export default PageTitle
