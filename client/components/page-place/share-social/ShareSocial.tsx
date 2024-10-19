'use client'

import React, { useEffect } from 'react'
import {
    OKIcon,
    OKShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    ViberIcon,
    ViberShareButton,
    VKIcon,
    VKShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from 'react-share'
import { useTranslation } from 'next-i18next'
import { Container, Spinner } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { API } from '@/api/api'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { addDecimalPoint } from '@/functions/helpers'
import Rating from '@/ui/rating'

interface SocialRatingProps {
    placeId?: string
    placeUrl?: string
}

const ShareSocial: React.FC<SocialRatingProps> = ({ placeId, placeUrl }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const { data: ratingData, isLoading } = API.useRatingGetListQuery(placeId ?? '', {
        skip: !placeId,
        refetchOnMountOrArgChange: true
    })

    const [changeRating, { isLoading: ratingLoading, isSuccess }] = API.useRatingPutScoreMutation()

    const handleRatingChange = (value?: number) => {
        if (value && placeId) {
            changeRating({
                place: placeId,
                score: value
            })
        }
    }

    useEffect(() => {
        if (isSuccess && !ratingData?.vote && !isAuth) {
            dispatch(
                Notify({
                    id: 'placeRating',
                    title: '',
                    message: t('thank-you-for-rating'),
                    type: 'success'
                })
            )
        }
    }, [isSuccess])

    return (
        <Container className={styles.shareSocial}>
            <div className={styles.rating}>
                <Rating
                    value={ratingData?.rating}
                    voted={!!ratingData?.vote}
                    disabled={ratingLoading || isLoading}
                    onChange={handleRatingChange}
                />

                <div className={styles.ratingValue}>
                    {isLoading || ratingLoading ? <Spinner /> : addDecimalPoint(ratingData?.rating)}
                </div>
            </div>

            <div className={styles.share}>
                <TelegramShareButton url={placeUrl!}>
                    <TelegramIcon size={22} />
                </TelegramShareButton>

                <WhatsappShareButton url={placeUrl!}>
                    <WhatsappIcon size={22} />
                </WhatsappShareButton>

                <ViberShareButton url={placeUrl!}>
                    <ViberIcon size={22} />
                </ViberShareButton>

                <VKShareButton url={placeUrl!}>
                    <VKIcon size={22} />
                </VKShareButton>

                <OKShareButton url={placeUrl!}>
                    <OKIcon size={22} />
                </OKShareButton>

                <RedditShareButton url={placeUrl!}>
                    <RedditIcon size={22} />
                </RedditShareButton>
            </div>
        </Container>
    )
}

export default ShareSocial
