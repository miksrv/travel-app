import React from 'react'
import { Button } from 'simple-react-ui-kit'

import { ApiModel } from '@/api'
import { PlacesListItem } from '@/components/shared/places-list'
import { WidgetSection } from '@/components/shared/widget-section'
import { Carousel } from '@/components/ui'

import styles from './styles.module.sass'

// Always shows 4 cards on desktop widths, regardless of where it's used, so the home page
// and the place detail page carousels look identical for the same container width.
const DESKTOP_SLIDES_VISIBLE = 4

export interface PlacesCarouselFilter {
    key: string
    label: string
    active: boolean
    disabled?: boolean
    onClick: () => void
}

interface PlacesCarouselProps {
    title: string
    places?: ApiModel.Place[]
    actionHref: string
    actionLabel: string
    /** Marks the action link as `nofollow noindex`, e.g. for parameterized/near-duplicate listing URLs. */
    actionNoIndex?: boolean
    /** Optional sort/filter chips rendered above the carousel. When omitted, the action link aligns with the title. */
    filters?: PlacesCarouselFilter[]
}

export const PlacesCarousel: React.FC<PlacesCarouselProps> = ({
    title,
    places,
    actionHref,
    actionLabel,
    actionNoIndex,
    filters
}) => {
    if (!places?.length) {
        return null
    }

    const filtersRow = filters?.length ? (
        <div className={styles.filters}>
            {filters.map(({ key, label, active, disabled, onClick }) => (
                <Button
                    key={key}
                    size={'small'}
                    mode={active ? 'primary' : 'outline'}
                    className={styles.filterChip}
                    disabled={disabled}
                    onClick={onClick}
                >
                    {label}
                </Button>
            ))}
        </div>
    ) : undefined

    return (
        <WidgetSection
            title={title}
            actionHref={actionHref}
            actionLabel={actionLabel}
            actionNoIndex={actionNoIndex}
            extra={filtersRow}
        >
            <Carousel
                options={{ align: 'start', dragFree: true, loop: true }}
                slidesPerView={DESKTOP_SLIDES_VISIBLE}
            >
                {places.map((place) => (
                    <PlacesListItem
                        key={place.id}
                        place={place}
                    />
                ))}
            </Carousel>
        </WidgetSection>
    )
}
