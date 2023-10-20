import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'
import React from 'react'

import styles from './styles.module.sass'

interface CarouselProps {
    options?: EmblaOptionsType
    children?: React.ReactNode
}

const Carousel: React.FC<CarouselProps> = ({ options, children }) => {
    const [emblaRef] = useEmblaCarousel(options)

    return (
        <div className={styles.embla}>
            <div
                className={styles.embla__viewport}
                ref={emblaRef}
            >
                <div className={styles.embla__container}>{children}</div>
            </div>
        </div>
    )
}

export default Carousel
