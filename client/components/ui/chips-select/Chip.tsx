import React from 'react'
import { Icon } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

interface ChipProps {
    text: string
    onClickRemove?: (text: string) => void
}

export const Chip: React.FC<ChipProps> = ({ text, onClickRemove }) => (
    <div className={styles.chip}>
        <span className={styles.text}>{text}</span>
        <button
            className={styles.close}
            onClick={() => onClickRemove?.(text)}
        >
            <Icon name={'Close'} />
        </button>
    </div>
)
