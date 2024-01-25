import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'

import { wrapper } from '@/api/store'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import PlaceForm from '@/components/place-form'

const PAGE_TITLE = 'Добавить интересное место'

interface CreatePlacePageProps {}

const CreatePlacePage: NextPage<CreatePlacePageProps> = () => (
    <AppLayout>
        <NextSeo title={PAGE_TITLE} />
        <Header
            title={PAGE_TITLE}
            currentPage={'Добавить новое'}
            links={[
                {
                    link: '/places/',
                    text: 'Интересные места'
                }
            ]}
        />
        <Container>
            <PlaceForm />
        </Container>
    </AppLayout>
)

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async (
            context
        ): Promise<GetServerSidePropsResult<CreatePlacePageProps>> => {
            const locale = context.locale ?? 'en'

            const translations = await serverSideTranslations(locale)

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default CreatePlacePage
