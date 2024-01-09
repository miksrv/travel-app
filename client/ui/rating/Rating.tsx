import React, { useState } from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface RatingProps {
    value?: number
    onChange?: (rating?: number) => void
}

const Rating: React.FC<RatingProps> = ({ value, onChange }) => {
    const [hoverRating, setHoverRating] = useState<number>()

    const showFullStar = (rating: number) =>
        (!hoverRating && value && value >= (rating || 0)) ||
        (hoverRating && hoverRating >= rating)

    return (
        <ul className={styles.component}>
            {[1, 2, 3, 4, 5].map((rating) => (
                <li
                    key={value}
                    className={cn(
                        hoverRating && hoverRating >= rating
                            ? styles.hovered
                            : undefined,
                        hoverRating === rating ? styles.current : undefined
                    )}
                    onMouseEnter={() => {
                        setHoverRating(rating)
                    }}
                    onMouseLeave={() => {
                        setHoverRating(undefined)
                    }}
                    onClick={() => {
                        onChange?.(rating)
                    }}
                >
                    <label
                        className={
                            showFullStar(rating) ? styles.fullStar : undefined
                        }
                    >
                        {showFullStar(rating) ? (
                            <IconFullStar />
                        ) : (
                            <IconEmptyStar />
                        )}
                        <input
                            type={'radio'}
                            value={rating}
                            checked={value === rating}
                        />
                    </label>
                </li>
            ))}
        </ul>
    )
}

const IconEmptyStar = () => (
    <svg viewBox='0 0 24 24'>
        <path d='m22 9.24-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z' />
    </svg>
)

const IconFullStar = () => (
    <svg viewBox='0 0 24 24'>
        <path d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
    </svg>
)

export default Rating
