import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Container from '@/ui/container'

import { Category } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

interface CategoriesListProps {
    categories?: Category[]
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.categoriesList'
    })

    return (
        <Container className={styles.categoriesList}>
            {categories?.map((category) => (
                <div
                    key={`category${category.name}`}
                    className={styles.categoryItem}
                >
                    <h3 className={styles.header}>
                        <Image
                            className={styles.categoryImage}
                            src={categoryImage(category.name)?.src}
                            alt={''}
                            width={15}
                            height={18}
                            style={{ marginRight: '4px' }}
                        />
                        <Link
                            href={`/places?category=${category.name}`}
                            title={`${category.title} - ${t(
                                'allCategoryPlaces'
                            )}`}
                        >
                            {category.title}
                        </Link>
                    </h3>
                    <div>
                        <p>{category?.content}</p>
                        <p className={styles.description}>
                            <noindex>
                                {t('placesInCategory')}{' '}
                                <strong>{category?.count ?? 0}</strong>
                            </noindex>
                            <Link
                                href={`/places?category=${category.name}`}
                                title={`${category.title} - ${t(
                                    'allCategoryPlaces'
                                )}`}
                            >
                                {t('goToCategory')}
                            </Link>
                        </p>
                    </div>
                </div>
            ))}
        </Container>
    )
}

export default CategoriesList
