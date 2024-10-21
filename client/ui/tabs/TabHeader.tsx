import React from 'react'
import { cn } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

interface TabItemProps extends React.InputHTMLAttributes<HTMLButtonElement> {
    label?: string
    isActive?: boolean
}

const TabHeader: React.FC<TabItemProps> = ({ label, isActive, ...props }) => (
    <button
        {...props}
        type={'button'}
        className={cn(styles.tabsHeaderItem, isActive && styles.active)}
    >
        {label}
        <div className={cn(styles.itemBottom, isActive && styles.active)} />
    </button>
)

export default TabHeader
