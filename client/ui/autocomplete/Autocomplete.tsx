import debounce from 'lodash-es/debounce'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Icon from '@/ui/icon'
import Loader from '@/ui/loader'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

type DropdownOptions = {
    key: string | number
    value: string
    type?: string
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
    onSelect?: (option: T) => void
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
    const [localLoading, setLocaLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [selectedOption, setSelectedOption] = useState<
        DropdownOptions | undefined
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

    const handleSelect = (option: DropdownOptions | undefined) => {
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
                    <input
                        type={'text'}
                        value={search || ''}
                        defaultValue={selectedOption?.value || value}
                        className={styles.searchInput}
                        placeholder={
                            placeholder ?? 'Введите значение для поиска'
                        }
                        onChange={handleChangeInput}
                    />
                    <span className={styles.arrow}>
                        {loading || localLoading ? (
                            <Loader className={styles.loader} />
                        ) : clearable && selectedOption?.key ? (
                            <button
                                className={styles.clear}
                                type={'button'}
                                onClick={handleClearClick}
                            >
                                <Icon name={'Close'} />
                            </button>
                        ) : (
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
                        )}
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
                                        option?.type === selectedOption?.type &&
                                        styles.active
                                )}
                            >
                                <button onClick={() => handleSelect(option)}>
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
