import { Card } from '@mui/material'
import { NextPage } from 'next'

import PageLayout from '@/components/page-layout'

const Main: NextPage = () => {
    return (
        <PageLayout>
            <Card sx={{ height: '80vh', mt: 3 }}>Главная страница</Card>
        </PageLayout>
    )
}

export default Main
