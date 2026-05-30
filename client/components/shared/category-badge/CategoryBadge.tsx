import React from 'react'
import { cn } from 'simple-react-ui-kit'

import Image from 'next/image'

import { ApiModel } from '@/api'
import { categoryImage } from '@/utils/categories'

import { CATEGORY_COLORS } from './constants'

import styles from './styles.module.sass'

interface CategoryBadgeProps {
    category: ApiModel.Category
    className?: string
    iconOnly?: boolean
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className, iconOnly }) => {
    const color = CATEGORY_COLORS[category.name] ?? '#6B7280'

    return (
        <span
            className={cn(styles.categoryBadge, iconOnly && styles.iconOnly, className)}
            style={iconOnly ? undefined : { backgroundColor: color + '50' }}
            title={iconOnly ? category.title : undefined}
        >
            <Image
                src={categoryImage(category.name).src}
                alt={category.title}
                width={iconOnly ? 16 : 13}
                height={iconOnly ? 16 : 13}
            />
            {!iconOnly && category.title}
        </span>
    )
}
