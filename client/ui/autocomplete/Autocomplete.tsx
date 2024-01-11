import debounce from 'lodash-es/debounce'
import Image, { StaticImageData } from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import Icon from '@/ui/icon'

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
    loading?: boolean
    disabled?: boolean
    clearable?: boolean
    placeholder?: string
    label?: string
    value?: T
    onSelect?: (selectedOption: T) => void
    onSearch?: (value: string) => void
}

const Autocomplete: React.FC<DropdownProps<any>> = (props) => {
    const {
        className,
        options,
        disabled,
        loading,
        clearable,
        value,
        placeholder,
        label,
        onSelect,
        onSearch
    } = props

    const [search, setSearch] = useState<string>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [selectedOption, setSelectedOption] = useState<
        DropdownOptions | undefined
    >(undefined)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleChangeInput = debounce((event) => {
        const value = event.target.value
        setSearch(value)
        onSearch?.(value)
    }, 1000)

    const handleSelect = (option: DropdownOptions | undefined) => {
        if (selectedOption?.key !== option?.key) {
            setSelectedOption(option)
            onSelect?.(option?.key)
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

    const handleClearClick = (event: React.MouseEvent) => {
        event.stopPropagation()
        setSearch(value)
        handleSelect(undefined)
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

    useEffect(() => {
        if (search) {
            setIsOpen(true)
        }
    }, [options])

    return (
        <div
            ref={dropdownRef}
            className={cn(className, styles.autocomplete)}
        >
            {label && <label className={styles.label}>{label}</label>}
            <div
                className={cn(
                    styles.container,
                    isOpen && styles.open,
                    disabled && styles.disabled
                )}
            >
                <div className={styles.searchContainer}>
                    <span>
                        {selectedOption?.image && (
                            <Image
                                className={styles.categoryIcon}
                                src={selectedOption.image.src}
                                alt={''}
                                width={22}
                                height={26}
                            />
                        )}
                    </span>
                    <input
                        type={'text'}
                        className={styles.searchInput}
                        placeholder={
                            placeholder ?? 'Введите значение для поиска'
                        }
                        onChange={handleChangeInput}
                    />
                    <span className={styles.arrow}>
                        {clearable && selectedOption?.key && (
                            <button
                                className={styles.clear}
                                type={'button'}
                                onClick={handleClearClick}
                            >
                                <Icon name={'Close'} />
                            </button>
                        )}
                        <button
                            className={styles.toggleButton}
                            type={'button'}
                            onClick={toggleDropdown}
                        >
                            {isOpen ? (
                                <Icon name={'Up'} />
                            ) : (
                                <Icon name={'Down'} />
                            )}
                        </button>
                    </span>
                </div>
                {isOpen && (
                    <ul className={styles.optionsList}>
                        {!options?.length && (
                            <li className={styles.emptyItem}>
                                {'Пока что ничего не найдено'}
                            </li>
                        )}
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

export default Autocomplete
