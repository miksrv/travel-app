import { Card } from '@mui/material'
import { NextPage } from 'next'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import PageLayout from '@/components/page-layout'

const Main: NextPage = () => {
    const { t } = useTranslation('common')

    return (
        <PageLayout>
            <Card sx={{ height: '80vh', mt: 3 }}>{t('HELLO_WORLD')}</Card>
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default Main
