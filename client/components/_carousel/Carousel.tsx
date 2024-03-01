// yarn add embla-carousel-react
// import useEmblaCarousel, {
//     EmblaCarouselType,
//     EmblaOptionsType
// } from 'embla-carousel-react'
// import React, { useCallback, useEffect, useState } from 'react'
//
// import { NextButton, PrevButton } from './CarouselButtons'
// import styles from './styles.module.sass'
//
// interface CarouselProps {
//     options?: EmblaOptionsType
//     children?: React.ReactNode
// }
//
// const Carousel: React.FC<CarouselProps> = ({ options, children }) => {
//     const [emblaRef, emblaApi] = useEmblaCarousel(options)
//     const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
//     const [nextBtnDisabled, setNextBtnDisabled] = useState(true)
//
//     const scrollPrev = useCallback(
//         () => emblaApi && emblaApi.scrollPrev(),
//         [emblaApi]
//     )
//     const scrollNext = useCallback(
//         () => emblaApi && emblaApi.scrollNext(),
//         [emblaApi]
//     )
//
//     const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
//         setPrevBtnDisabled(!emblaApi.canScrollPrev())
//         setNextBtnDisabled(!emblaApi.canScrollNext())
//     }, [])
//
//     useEffect(() => {
//         if (!emblaApi) return
//
//         onSelect(emblaApi)
//         emblaApi.on('reInit', onSelect)
//         emblaApi.on('select', onSelect)
//     }, [emblaApi, onSelect])
//
//     return (
//         <div className={styles.carousel}>
//             <div
//                 className={styles.viewport}
//                 ref={emblaRef}
//             >
//                 <div className={styles.container}>{children}</div>
//             </div>
//
//             <div className={styles.buttonsContainer}>
//                 <PrevButton
//                     onClick={scrollPrev}
//                     disabled={prevBtnDisabled}
//                 />
//                 <NextButton
//                     onClick={scrollNext}
//                     disabled={nextBtnDisabled}
//                 />
//             </div>
//         </div>
//     )
// }
//
// export default Carousel
