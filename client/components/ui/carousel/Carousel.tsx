import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'

import { useTranslation } from 'next-i18next/pages'

import { NextButton, PrevButton, usePrevNextButtons } from './CarouselButtons'

import styles from './styles.module.sass'

/**
 * Generic embla-based slider. Currently used inside PlacesCarousel
 * (components/widgets/places-carousel), which renders it on the home page
 * ("Popular places" section) and on the place detail page ("Nearby places" section).
 */
interface CarouselProps {
    options?: EmblaOptionsType
    /** Number of slides visible at once on desktop widths (mobile always shows one). Defaults to 3. */
    slidesPerView?: number
    children?: React.ReactNode
}

export const Carousel: React.FC<CarouselProps> = ({ options, slidesPerView, children }) => {
    const { t } = useTranslation()
    const [emblaRef, emblaApi] = useEmblaCarousel(options)

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi)

    return (
        <div
            className={styles.carousel}
            style={slidesPerView ? ({ '--slides-per-view': slidesPerView } as React.CSSProperties) : undefined}
        >
            <div
                ref={emblaRef}
                className={styles.viewport}
            >
                <div className={styles.container}>{children}</div>
            </div>

            <div className={styles.buttonsContainer}>
                <PrevButton
                    aria-label={t('prev', { defaultValue: 'Назад' })}
                    onClick={onPrevButtonClick}
                    disabled={prevBtnDisabled}
                />
                <NextButton
                    aria-label={t('next', { defaultValue: 'Вперёд' })}
                    onClick={onNextButtonClick}
                    disabled={nextBtnDisabled}
                />
            </div>
        </div>
    )
}
