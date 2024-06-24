import Image from 'next/image'
import {
    isImageFitCover,
    isImageSlide,
    useLightboxProps,
    useLightboxState
} from 'yet-another-react-lightbox'

const isNextJsImage = (slide) =>
    isImageSlide(slide) &&
    typeof slide.width === 'number' &&
    typeof slide.height === 'number'

const ImageSlide = ({ slide, offset, rect }) => {
    const {
        on: { click },
        carousel: { imageFit }
    } = useLightboxProps()

    const { currentIndex } = useLightboxState()

    const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)

    if (!isNextJsImage(slide)) return undefined

    const width = !cover
        ? Math.round(
              Math.min(rect.width, (rect.height / slide.height) * slide.width)
          )
        : rect.width

    const height = !cover
        ? Math.round(
              Math.min(rect.height, (rect.width / slide.width) * slide.height)
          )
        : rect.height

    return (
        <div style={{ height, position: 'relative', width }}>
            <Image
                fill
                alt=''
                src={slide}
                loading='eager'
                draggable={false}
                placeholder={slide.blurDataURL ? 'blur' : undefined}
                style={{
                    cursor: click ? 'pointer' : undefined,
                    objectFit: cover ? 'cover' : 'contain'
                }}
                sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
                onClick={
                    offset === 0
                        ? () => click?.({ index: currentIndex })
                        : undefined
                }
            />
        </div>
    )
}

export default ImageSlide
