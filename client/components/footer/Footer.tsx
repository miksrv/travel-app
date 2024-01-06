import React from 'react'

import styles from './styles.module.sass'

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => (
    <footer className={styles.component}>{'Footer'}</footer>
)

export default Footer
