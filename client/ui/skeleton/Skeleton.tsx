import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

const Skeleton: React.FC<SkeletonProps> = ({ ...props }) => (
    <div
        {...props}
        className={cn(styles.skeleton, props.className)}
    />
)

export default Skeleton
