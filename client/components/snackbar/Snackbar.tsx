import React from 'react'

import styles from './styles.module.sass'

interface FooterProps {}

const Snackbar: React.FC<FooterProps> = () => (
    <div className={styles.snackbar}>
        <div>Аватар успешно изменен</div>
        <div>Аватар успешно изменен</div>
    </div>
)

export default Snackbar
