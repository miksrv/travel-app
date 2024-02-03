import debounce from 'lodash-es/debounce'
import { useTranslation } from 'next-i18next'
import Image, { StaticImageData } from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'
import Spinner from '@/ui/spinner'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

type DropdownOption = {
    key: string | number
    value: string
    type?: string
    image?: StaticImageData
    description?: string
}

interface DropdownProps<T> {
    className?: string
    options?: DropdownOption[]
    loading?: boolean
    disabled?: boolean
    clearable?: boolean
    hideArrow?: boolean
    placeholder?: string
    label?: string
    value?: T
    leftIcon?: IconTypes
    onSelect?: (option: T) => void
    onSearch?: (value: string) => void
}

const Autocomplete: React.FC<DropdownProps<any>> = ({
    className,
    options,
    disabled,
    loading,
    clearable,
    hideArrow,
    value,
    placeholder,
    label,
    leftIcon,
    onSelect,
    onSearch
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'ui.autocomplete'
    })

    const [search, setSearch] = useState<string>()
    const [localLoading, setLocaLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [selectedOption, setSelectedOption] = useState<
        DropdownOption | undefined
    >(undefined)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleDebouncedSearch = useCallback(
        debounce((value) => {
            onSearch?.(value)
            setLocaLoading(false)
        }, 1000),
        []
    )

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value

        if (value.length > 0) {
            setLocaLoading(true)
        } else {
            setLocaLoading(false)
        }

        setSearch(value)
        handleDebouncedSearch(value)
    }

    const handleSelect = (option: DropdownOption | undefined) => {
        if (selectedOption?.key !== option?.key) {
            setSelectedOption(option)
            setSearch(option?.value)
            onSelect?.(option)
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
        setSearch(undefined)
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
            setSearch(value.value)
            setSelectedOption(
                options?.find(({ key }) => value === key) ?? value ?? undefined
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
                    {leftIcon && (
                        <span className={styles.leftIcon}>
                            <Icon name={leftIcon} />
                        </span>
                    )}
                    <input
                        type={'text'}
                        value={search || ''}
                        defaultValue={selectedOption?.value ?? value?.name}
                        className={styles.searchInput}
                        placeholder={placeholder ?? t('placeholder')}
                        onMouseMove={(e) => e.stopPropagation()}
                        onChange={handleChangeInput}
                    />
                    <span className={styles.arrow}>
                        {loading || localLoading ? (
                            <Spinner className={styles.loader} />
                        ) : clearable && selectedOption?.key ? (
                            <button
                                className={styles.clear}
                                type={'button'}
                                onClick={handleClearClick}
                            >
                                <Icon name={'Close'} />
                            </button>
                        ) : !hideArrow ? (
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
                        ) : (
                            <></>
                        )}
                    </span>
                </div>
                {isOpen && (
                    <ul className={styles.optionsList}>
                        {!options?.length && (
                            <li className={styles.emptyItem}>
                                {t('notFound')}
                            </li>
                        )}
                        {options?.map((option) => (
                            <li
                                key={option.key}
                                className={cn(
                                    option.key === selectedOption?.key &&
                                        option?.type === selectedOption?.type &&
                                        styles.active
                                )}
                            >
                                <button
                                    onClick={() => handleSelect(option)}
                                    onMouseMove={(e) => e.stopPropagation()}
                                >
                                    <div className={styles.content}>
                                        {option.image && (
                                            <Image
                                                className={styles.optionImage}
                                                src={option.image.src}
                                                alt={''}
                                                width={22}
                                                height={26}
                                            />
                                        )}
                                        <span>{option.value}</span>
                                    </div>
                                    {option?.description && (
                                        <div className={styles.description}>
                                            {option.description}
                                        </div>
                                    )}
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
