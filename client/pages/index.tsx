import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import React, { useCallback, useMemo, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'
import Dialog from '@/ui/dialog'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import OptionsList from '@/ui/dropdown/OptionsList'

import { API } from '@/api/api'
import { setLocale, toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import { PlacesFilterType } from '@/components/places-filter-panel/types'

import { categoryImage } from '@/functions/categories'
import { encodeQueryData } from '@/functions/helpers'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

type OpenedOptionsType = 'category' | undefined

interface IndexPageProps {
    category: string | null
}

const IndexPage: NextPage<IndexPageProps> = ({ category }) => {
    const { t } = useTranslation('common', { keyPrefix: 'pages.index' })

    const dispatch = useAppDispatch()
    const router = useRouter()

    const location = useAppSelector((state) => state.application.userLocation)
    const [mapBounds, setMapBounds] = useState<string>()
    const [filtersDialogOpen, setFiltersDialogOpen] = useState<boolean>(false)
    const [openedOptions, setOpenedOptions] =
        useState<OpenedOptionsType>(undefined)

    const { data: categoryData } = API.useCategoriesGetListQuery()
    const { data: poiListData, isFetching } = API.usePoiGetListQuery(
        { bounds: mapBounds, category: category ?? undefined },
        { skip: !mapBounds }
    )

    const initialFilter: PlacesFilterType = {
        category: category ?? undefined
    }

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds) => {
            setMapBounds(bounds.toBBoxString())
        }, 500),
        []
    )

    const filtersCount = useMemo(() => {
        let count = 0

        if (category) {
            count++
        }

        return count
    }, [category])

    const categoryOptions = useMemo(
        () =>
            categoryData?.items?.map((item) => ({
                image: categoryImage(item.name),
                key: item.name,
                value: item.title
            })),
        [categoryData?.items]
    )

    const handleOpenOptionsCategory = () => {
        setOpenedOptions('category')
    }

    const handleFiltersBackLink = () => {
        setOpenedOptions(undefined)
    }

    const handleChangeCategory = async (value: DropdownOption | undefined) => {
        setOpenedOptions(undefined)
        await handleChangeFilter('category', value?.key)
    }

    const handleClickOpenFiltersDialog = () => {
        dispatch(toggleOverlay(true))
        setFiltersDialogOpen(true)
    }

    const handleFiltersDialogClose = () => {
        dispatch(toggleOverlay(false))
        setFiltersDialogOpen(false)
    }

    const handleChangeFilter = async (
        key: keyof PlacesFilterType,
        value: string | number | undefined
    ) => {
        const filter = { ...initialFilter, [key]: value }
        const update = {
            category: filter.category ?? undefined
        }

        setOpenedOptions(undefined)

        return await router.replace('/' + encodeQueryData(update))
    }

    return (
        <AppLayout>
            <NextSeo title={t('title')} />
            <Header
                title={t('title')}
                currentPage={t('breadCrumbCurrent')}
                hideHomePage={true}
                actions={
                    <>
                        <div>
                            {t('pointsCount')}{' '}
                            <strong>{poiListData?.count ?? 0}</strong>
                        </div>
                        <Button
                            size={'m'}
                            mode={'primary'}
                            icon={'Tune'}
                            onClick={handleClickOpenFiltersDialog}
                        >
                            {`${t('buttonFilters')} ${
                                filtersCount > 0 ? `(${filtersCount})` : ''
                            }`}
                        </Button>
                    </>
                }
            />
            <Container
                style={{
                    height: 'calc(100vh - 165px)',
                    minHeight: '400px',
                    padding: '4px'
                }}
            >
                <InteractiveMap
                    storeMapPosition={true}
                    enableSearch={true}
                    enableFullScreen={true}
                    enableLayersSwitcher={true}
                    loading={isFetching}
                    places={poiListData?.items}
                    onChangeBounds={debounceSetMapBounds}
                    userLatLon={location}
                />
            </Container>

            <Dialog
                contentHeight={'280px'}
                header={t('dialogFiltersTitle')}
                open={filtersDialogOpen}
                showBackLink={!!openedOptions}
                onBackClick={handleFiltersBackLink}
                onCloseDialog={handleFiltersDialogClose}
            >
                {openedOptions === 'category' && (
                    <OptionsList
                        selectedOption={categoryOptions?.find(
                            ({ key }) => key === category
                        )}
                        options={categoryOptions}
                        onSelect={handleChangeCategory}
                    />
                )}

                {!openedOptions && (
                    <Dropdown
                        clearable={true}
                        value={categoryOptions?.find(
                            ({ key }) => key === category
                        )}
                        label={t('dropdownCategoryLabel')}
                        placeholder={t('dropdownCategoryPlaceholder')}
                        onSelect={handleChangeCategory}
                        onOpen={handleOpenOptionsCategory}
                    />
                )}
            </Dialog>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<IndexPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const category = (context.query.category as string) || null

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    category
                }
            }
        }
)

export default IndexPage
