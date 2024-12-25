import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { Button, Checkbox, Container } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { API, ApiModel } from '@/api'
import { categoryImage } from '@/functions/categories'

interface CategoryControlProps {
    categories?: ApiModel.Categories[]
    onChangeCategories?: (categories?: ApiModel.Categories[]) => void
}

const CategoryControl: React.FC<CategoryControlProps> = ({ categories, onChangeCategories }) => {
    const { t } = useTranslation()

    const layersContainerRef = useRef<HTMLUListElement>(null)
    const [open, setOpen] = useState<boolean>(false)

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const handleToggleOpen = () => {
        setOpen(!open)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (layersContainerRef.current && !layersContainerRef.current.contains(event.target as Node)) {
            setOpen(false)
        }
    }

    const handleChangeCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const category = event.target.id as ApiModel.Categories

        onChangeCategories?.(
            !event.target.checked
                ? (categories?.filter((item) => item !== category) ?? [])
                : [...(categories ?? []), category]
        )
    }

    const handleChangeAllCategories = () => {
        if (categories?.length === Object.values(ApiModel.Categories).length) {
            onChangeCategories?.([])
        } else {
            onChangeCategories?.(Object.values(ApiModel.Categories))
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return !open ? (
        <Button
            mode={'secondary'}
            icon={'Tune'}
            onClick={handleToggleOpen}
        />
    ) : (
        <Container
            className={styles.mapCategoryContainer}
            onMouseMove={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
        >
            <ul
                ref={layersContainerRef}
                className={styles.mapCategoryList}
            >
                <li className={styles.allCategories}>
                    <Checkbox
                        id={'allCategories'}
                        label={t('all-categories-of-geotags')}
                        checked={categories?.length === Object.values(ApiModel.Categories).length}
                        indeterminate={
                            categories &&
                            categories.length !== Object.values(ApiModel.Categories).length &&
                            categories.length > 0
                        }
                        onChange={handleChangeAllCategories}
                    />
                </li>
                {categoryData?.items?.map((item) => (
                    <li key={item.name}>
                        <Checkbox
                            id={item.name}
                            label={
                                <>
                                    <Image
                                        src={categoryImage(item.name).src}
                                        alt={''}
                                        width={15}
                                        height={18}
                                        style={{ marginRight: '4px' }}
                                    />
                                    {item.title}
                                </>
                            }
                            checked={categories?.includes(item.name)}
                            onChange={handleChangeCategory}
                        />
                    </li>
                ))}
            </ul>
        </Container>
    )
}

export default CategoryControl
