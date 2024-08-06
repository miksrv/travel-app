import React from 'react'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { concatClassNames as cn } from '@/functions/helpers'

interface PhotoGalleryProps {
    disabled?: boolean
    onClick?: () => void
}

const PhotoUploadSection: React.FC<PhotoGalleryProps> = ({ disabled, onClick }) => {
    const { t } = useTranslation()

    return (
        <button
            className={cn(styles.photoUploadSection, disabled && styles.disabled)}
            onClick={onClick}
        >
            <div className={styles.image} />
            <div>{t('click-here-upload-photos')}</div>
            <div className={styles.hint}>{t('supported-formats')} JPG, JPEG, PNG</div>
        </button>
    )
}

export default PhotoUploadSection
