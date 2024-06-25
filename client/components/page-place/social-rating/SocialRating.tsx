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

import styles from './styles.module.sass'

import { API } from '@/api/api'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch } from '@/api/store'
import Container from '@/ui/container'
import Rating from '@/ui/rating'

interface SocialRatingProps {
    placeId?: string
    placeUrl?: string
    ratingValue?: number | null
}

const SocialRating: React.FC<SocialRatingProps> = ({ placeId, placeUrl, ratingValue }) => {
    const dispatch = useAppDispatch()

    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.socialRating'
    })

    const { data: ratingData } = API.useRatingGetListQuery(placeId!, {
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
        if (isSuccess && !ratingData?.vote) {
            dispatch(
                Notify({
                    id: 'placeRating',
                    message: t('ratingSuccess'),
                    type: 'success'
                })
            )
        }
    }, [isSuccess])

    return (
        <Container className={styles.socialRating}>
            <div className={styles.rating}>
                <div className={styles.ratingCaption}>{t('userRating')}</div>
                <Rating
                    value={ratingData?.vote ?? ratingValue ?? undefined}
                    disabled={ratingLoading}
                    onChange={handleRatingChange}
                />
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

export default SocialRating
