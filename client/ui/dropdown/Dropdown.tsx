import Image, { StaticImageData } from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import Icon from '@/ui/icon'

import { categoryImage } from '@/functions/categories'
import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

type DropdownOptions = {
    key: string | number
    value: React.ReactNode | string | number
    image?: StaticImageData
}

interface DropdownProps<T> {
    className?: string
    options?: DropdownOptions[]
    disabled?: boolean
    placeholder?: string
    label?: string
    value?: T
    onSelect?: (selectedOption: T) => void
}

const Dropdown: React.FC<DropdownProps<any>> = (props) => {
    const {
        className,
        options,
        disabled,
        value,
        placeholder,
        label,
        onSelect
    } = props

    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<DropdownOptions>()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleSelect = (option: DropdownOptions) => {
        if (selectedOption?.key !== option.key) {
            setSelectedOption(option)
            onSelect?.(option.key)
        }

        setIsOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (!value) {
            setSelectedOption(undefined)
        }

        if (value) {
            setSelectedOption(
                options?.find(({ key }) => value === key) ?? undefined
            )
        }
    }, [value])

    return (
        <div
            ref={dropdownRef}
            className={cn(className, styles.dropdown)}
        >
            {label && <label className={styles.label}>{label}</label>}

            <div
                className={cn(
                    styles.container,
                    isOpen && styles.open,
                    disabled && styles.disabled
                )}
            >
                <button
                    onClick={toggleDropdown}
                    disabled={disabled}
                    className={cn(
                        styles.dropdownButton,
                        selectedOption && styles.selected
                    )}
                >
                    <span>
                        {selectedOption?.value ??
                            placeholder ??
                            'Выберите опцию'}
                    </span>
                    <span className={styles.arrow}>
                        {isOpen ? <Icon name={'Down'} /> : <Icon name={'Up'} />}
                    </span>
                </button>
                {isOpen && (
                    <ul className={styles.optionsList}>
                        {options?.map((option) => (
                            <li
                                key={option.key}
                                className={cn(
                                    option.key === selectedOption?.key &&
                                        styles.active
                                )}
                            >
                                <button onClick={() => handleSelect(option)}>
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
                )}
            </div>
        </div>
    )
}

export default Dropdown
