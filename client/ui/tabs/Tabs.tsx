import React from 'react'
import { cn, Container, ContainerProps } from 'simple-react-ui-kit'

import styles from './styles.module.sass'
import TabHeader from './TabHeader'

type TabType<T> = {
    label: string
    key: T
}

interface TabsProps<T> extends ContainerProps {
    children?: React.ReactNode
    tabs?: TabType<T>[]
    activeTab?: T
    onChangeTab?: (key?: T) => void
}

const Tabs = <T extends string>({ tabs, activeTab, children, onChangeTab, ...props }: TabsProps<T>) => (
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

export default Tabs
