import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import Button from '@/ui/button'
import Checkbox from '@/ui/checkbox'
import Container from '@/ui/container'

import { API } from '@/api/api'
import { Categories } from '@/api/types/Place'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

interface CategoryControlProps {
    categories?: Categories[]
    onChangeCategories?: (categories?: Categories[]) => void
}

const CategoryControl: React.FC<CategoryControlProps> = ({
    categories,
    onChangeCategories
}) => {
    const layersContainerRef = useRef<HTMLUListElement>(null)
    const [open, setOpen] = useState<boolean>(false)

    const { t } = useTranslation('common', {
        keyPrefix: 'components.interactiveMap.categoriesSwitcher'
    })

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const handleToggleOpen = () => {
        setOpen(!open)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (
            layersContainerRef.current &&
            !layersContainerRef.current.contains(event.target as Node)
        ) {
            setOpen(false)
        }
    }

    const handleChangeCategory = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const category = event.target.id as Categories

        onChangeCategories?.(
            !event.target.checked
                ? categories?.filter((item) => item !== category) || []
                : [...(categories || []), category]
        )
    }

    const handleChangeAllCategories = () => {
        if (categories?.length === Object.values(Categories)?.length) {
            onChangeCategories?.([])
        } else {
            onChangeCategories?.(Object.values(Categories))
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
                        label={t('allCategories')}
                        checked={
                            categories?.length ===
                            Object.values(Categories)?.length
                        }
                        indeterminate={
                            categories?.length !==
                                Object.values(Categories)?.length &&
                            categories?.length! > 0
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
                                        src={categoryImage(item.name)?.src}
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
