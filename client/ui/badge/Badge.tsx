import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import styles from './styles.module.sass'

interface BadgeProps {
    icon?: IconTypes
    children?: React.ReactNode
    content?: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ icon, children, content }) => (
    <div className={styles.badge}>
        {icon && <Icon name={icon} />}
        {children || content}
    </div>
)

export default Badge
