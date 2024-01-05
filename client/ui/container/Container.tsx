import React from 'react'

import styles from './styles.module.sass'

interface ContainerProps {
    children?: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ children, ...props }) => (
    <section
        {...props}
        className={styles.component}
    >
        {children}
    </section>
)

export default Container
