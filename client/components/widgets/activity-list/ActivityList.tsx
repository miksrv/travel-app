import React, { useState } from 'react'
import { Container, ContainerProps } from 'simple-react-ui-kit'

import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'
import { WidgetSection } from '@/components/shared/widget-section'

import { ActivityListItem } from './ActivityListItem'
import { ActivityListItemLoader } from './ActivityListItemLoader'

import styles from './styles.module.sass'

const PhotoLightbox = dynamic(
    () => import('@/components/shared/photo-lightbox/PhotoLightbox').then((m) => ({ default: m.PhotoLightbox })),
    { ssr: false }
)

interface ActivityListProps extends Pick<ContainerProps, 'footer'> {
    activities?: ApiModel.Activity[]
    title?: string
    actionHref?: string
    actionLabel?: string
    /** HTML `title` attribute for the action link, when it should differ from the visible label. */
    actionTitle?: string
    loading?: boolean
    compact?: boolean
    scrollable?: boolean
    hidePlaceName?: boolean
    hideCover?: boolean
}

export const ActivityList: React.FC<ActivityListProps> = ({
    activities,
    loading,
    title,
    actionHref,
    actionLabel,
    actionTitle,
    footer,
    compact,
    scrollable,
    hidePlaceName,
    hideCover
}) => {
    const { t } = useTranslation('components.activity-list')

    const [lightboxItem, setLightboxItem] = useState<{ itemIndex: number; photoIndex: number }>()

    if (!activities?.length && !loading) {
        return (
            <Container className={'emptyList'}>
                {t('nothing-here-yet', { defaultValue: 'Тут пока ничего нет' })}
            </Container>
        )
    }

    const content = (
        <>
            {activities?.map((item, index) => (
                <ActivityListItem
                    key={`activity-${index}`}
                    item={item}
                    compact={compact}
                    hidePlaceName={hidePlaceName}
                    hideCover={hideCover}
                    onPhotoClick={(photoIndex) => setLightboxItem({ itemIndex: index, photoIndex })}
                />
            ))}
            {loading && <ActivityListItemLoader />}
        </>
    )

    return (
        <WidgetSection
            title={title}
            actionHref={actionHref}
            actionLabel={actionLabel}
            actionTitle={actionTitle}
        >
            <Container footer={footer}>
                {scrollable ? <div className={styles.scrollableContent}>{content}</div> : content}
            </Container>

            {lightboxItem && (
                <PhotoLightbox
                    photos={activities?.[lightboxItem.itemIndex]?.photos}
                    photoIndex={lightboxItem.photoIndex}
                    showLightbox={true}
                    onCloseLightBox={() => setLightboxItem(undefined)}
                />
            )}
        </WidgetSection>
    )
}
