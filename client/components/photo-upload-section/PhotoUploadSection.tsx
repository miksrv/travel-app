import React from 'react'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

interface PhotoGalleryProps {
    onClick?: () => void
}

const PhotoUploadSection: React.FC<PhotoGalleryProps> = ({ onClick }) => {
    const { t } = useTranslation()

    return (
        <button
            className={styles.photoUploadSection}
            onClick={onClick}
        >
            <div className={styles.image} />
            <div>{t('click-here-upload-photos')}</div>
            <div className={styles.hint}>{t('supported-formats')} JPG, JPEG, PNG</div>
        </button>
    )
}

export default PhotoUploadSection
