import classNames from 'classnames'
import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'

import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface CarouselProps {
    placeId: string
    slides: Photo[]
    options?: any
    onClick?: (fileName: string) => void
}

const Carousel: React.FC<CarouselProps> = (props) => {
    const { placeId, slides, options, onClick } = props
    const [emblaRef] = useEmblaCarousel(options)

    return (
        <div className={styles.embla}>
            <div
                className={styles.embla__viewport}
                ref={emblaRef}
            >
                <div className={styles.embla__container}>
                    {slides.map((photo) => (
                        <div
                            className={styles.embla__slide}
                            key={photo.filename}
                        >
                            <img
                                className={classNames(
                                    styles.embla__slide__img,
                                    onClick ? styles.point : undefined
                                )}
                                src={`http://localhost:8080/photo/${placeId}/${photo.filename}_thumb.${photo.extension}`}
                                alt={photo.title || ''}
                                onClick={() => onClick?.(photo.filename)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Carousel
