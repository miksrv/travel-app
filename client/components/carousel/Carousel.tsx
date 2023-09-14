import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'

import { Photo } from '@/api/types/Photo'

import styles from './styles.module.sass'

interface CarouselProps {
    placeId: string
    slides: Photo[]
    options: any
}

const Carousel: React.FC<CarouselProps> = (props) => {
    const { placeId, slides, options } = props
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
                            {/*<div className={styles.embla__slide__number}>*/}
                            {/*    <span>{photo.filename}</span>*/}
                            {/*</div>*/}
                            <img
                                className={styles.embla__slide__img}
                                src={`http://localhost:8080/photos/${placeId}/${photo.filename}_thumb.${photo.extension}`}
                                alt={photo.title || ''}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Carousel
