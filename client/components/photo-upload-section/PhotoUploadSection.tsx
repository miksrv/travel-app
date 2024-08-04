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
            <div>Нажите сюда для загрузки фотографий</div>
            <div className={styles.hint}>Поддерживаются форматы JPG, JPEG, PNG</div>
        </button>
    )
}

export default PhotoUploadSection
