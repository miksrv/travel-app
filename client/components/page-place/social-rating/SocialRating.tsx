import { useTranslation } from 'next-i18next'
import React from 'react'
import {
    OKIcon,
    OKShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    VKIcon,
    VKShareButton,
    ViberIcon,
    ViberShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from 'react-share'

import Container from '@/ui/container'
import Rating from '@/ui/rating'

import { API } from '@/api/api'

import styles from './styles.module.sass'

interface SocialRatingProps {
    placeId?: string
    placeUrl?: string
    ratingValue?: number | null
}

const SocialRating: React.FC<SocialRatingProps> = ({
    placeId,
    placeUrl,
    ratingValue
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.socialRating'
    })

    const [changeRating, { isLoading: ratingLoading }] =
        API.useRatingPutScoreMutation()

    const handleRatingChange = (value?: number) => {
        if (value && placeId) {
            changeRating({
                place: placeId,
                score: value
            })
        }
    }

    return (
        <Container className={styles.socialRating}>
            <div className={styles.rating}>
                <div className={styles.ratingCaption}>{t('userRating')}</div>
                <Rating
                    value={ratingValue ?? undefined}
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
