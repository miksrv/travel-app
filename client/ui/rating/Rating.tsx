'use client'

import React, { useState } from 'react'

import Icon from '@/ui/icon'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface RatingProps {
    value?: number
    disabled?: boolean
    onChange?: (rating: number) => void
}

const Rating: React.FC<RatingProps> = ({ value, disabled, onChange }) => {
    const [hoverRating, setHoverRating] = useState<number>()

    const showFullStar = (rating: number) =>
        (!hoverRating && value && value >= (rating || 0)) ||
        (hoverRating && hoverRating >= rating)

    return (
        <ul className={styles.rating}>
            {[1, 2, 3, 4, 5].map((rating) => (
                <li
                    key={`ratingItem${rating}`}
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
                >
                    <label
                        className={
                            showFullStar(rating) ? styles.fullStar : undefined
                        }
                    >
                        {showFullStar(rating) ? (
                            <Icon name={'FilledStar'} />
                        ) : (
                            <Icon name={'Star'} />
                        )}
                        <input
                            type={'radio'}
                            value={rating}
                            checked={value === rating}
                            onChange={() => {
                                !disabled ? onChange?.(rating) : undefined
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    !disabled ? onChange?.(rating) : undefined
                                }
                            }}
                        />
                    </label>
                </li>
            ))}
        </ul>
    )
}

export default Rating
