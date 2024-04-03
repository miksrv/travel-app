import React from 'react'

import Container, { ContainerProps } from '@/ui/container'

import TabHeader from './TabHeader'
import styles from './styles.module.sass'

type TabType<T> = {
    label: string
    key: T
}

interface TabsProps<T> extends ContainerProps {
    children?: React.ReactNode
    tabs?: TabType<T>[]
    activeTab?: T
    onChangeTab?: (key: T) => void
}

const Tabs = <T extends string>({
    tabs,
    activeTab,
    children,
    onChangeTab,
    ...props
}: TabsProps<T>) => (
    <Container
        {...props}
        className={styles.tabs}
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
        <div className={styles.tabContent}>{children}</div>
    </Container>
)

export default Tabs
