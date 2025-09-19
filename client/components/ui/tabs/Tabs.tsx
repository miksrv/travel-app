import React from 'react'
import { cn, Container, ContainerProps } from 'simple-react-ui-kit'

import TabHeader from './TabHeader'

import styles from './styles.module.sass'

type TabType<T> = {
    label: string
    key: T
}

export interface TabsProps<T> extends ContainerProps {
    children?: React.ReactNode
    tabs?: Array<TabType<T>>
    activeTab?: T
    onChangeTab?: (key?: T) => void
}

export const Tabs = <T extends string>({ tabs, activeTab, children, onChangeTab, ...props }: TabsProps<T>) => (
    <Container
        {...props}
        className={cn(styles.tabs, !children && styles.noContent)}
        header={
            <div className={styles.tabsHeader}>
                {tabs?.map(({ label, key }) => (
                    <TabHeader
                        key={key}
                        label={label}
                        onClick={() => onChangeTab?.(key)}
                        isActive={activeTab === key}
                    />
                ))}
            </div>
        }
    >
        {children}
    </Container>
)
