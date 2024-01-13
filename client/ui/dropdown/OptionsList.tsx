import Image, { StaticImageData } from 'next/image'
import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

type DropdownOptions = {
    key: string | number
    value: React.ReactNode | string | number
    image?: StaticImageData
}

interface DropdownProps {
    options?: DropdownOptions[]
    selectedOption?: DropdownOptions
    onSelect?: (selectedOption: DropdownOptions) => void
}

const OptionsList: React.FC<DropdownProps> = ({
    selectedOption,
    options,
    onSelect
}) => (
    <ul className={styles.optionsList}>
        {options?.map((option) => (
            <li
                key={option.key}
                className={cn(
                    option.key === selectedOption?.key && styles.active
                )}
            >
                <button onClick={() => onSelect?.(option)}>
                    {option.image && (
                        <Image
                            className={styles.categoryIcon}
                            src={option.image.src}
                            alt={''}
                            width={22}
                            height={26}
                        />
                    )}
                    <span>{option.value}</span>
                </button>
            </li>
        ))}
    </ul>
)

export default OptionsList
