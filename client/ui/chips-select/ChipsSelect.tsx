import debounce from 'lodash-es/debounce'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Chip from '@/ui/chips-select/Chip'
import Icon from '@/ui/icon'
import Spinner from '@/ui/spinner'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ChipsSelectProps {
    className?: string
    options?: string[]
    loading?: boolean
    disabled?: boolean
    placeholder?: string
    label?: string
    value?: string[]
    onSelect?: (options: string[]) => void
    onSearch?: (value: string) => void
}

const ChipsSelect: React.FC<ChipsSelectProps> = ({
    className,
    options,
    disabled,
    loading,
    value,
    placeholder,
    label,
    onSelect,
    onSearch
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'ui.chipSelect'
    })

    const dropdownRef = useRef<HTMLDivElement>(null)
    const [search, setSearch] = useState<string>()
    const [localLoading, setLocaLoading] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleDebouncedSearch = useCallback(
        debounce((value) => {
            onSearch?.(value)
            setLocaLoading(false)
        }, 500),
        []
    )

    const optionInValue = (option?: string): boolean =>
        !!value?.find((item) => item.toLowerCase() === option?.toLowerCase())

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && search?.length) {
            if (!optionInValue(search)) {
                onSelect?.([...(value || []), search])
            }

            setIsOpen(false)
            setSearch(undefined)
        }

        if (event.key === 'Backspace' && value?.length && !search?.length) {
            const updateValue = [...value]

            updateValue.pop()

            onSelect?.(updateValue)
        }
    }

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value?.trim()

        if (value.length > 0) {
            setLocaLoading(true)
        } else {
            setLocaLoading(false)
        }

        setSearch(value)
        handleDebouncedSearch(value)
    }

    const handleSelect = (option: string) => {
        if (!optionInValue(option)) {
            onSelect?.([...(value || []), option])
        }

        setSearch(undefined)
        setIsOpen(false)
    }

    const handleClickRemove = (option: string) => {
        onSelect?.([...(value?.filter((item) => item !== option) || [])])
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
        if (search) {
            setIsOpen(true)
        }
    }, [options])

    return (
        <div
            ref={dropdownRef}
            className={cn(className, styles.chipsSelect)}
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
                    {value?.map((item, i) => (
                        <Chip
                            key={`tag${i}`}
                            text={item}
                            onClickRemove={handleClickRemove}
                        />
                    ))}
                    <input
                        type={'text'}
                        value={search || ''}
                        className={styles.searchInput}
                        placeholder={placeholder ?? t('placeholder')}
                        onKeyDown={handleKeyPress}
                        onChange={handleChangeInput}
                    />
                    <span className={styles.arrow}>
                        {loading || localLoading ? (
                            <Spinner className={styles.loader} />
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
                                {t('notFound')}
                            </li>
                        )}
                        {options?.map((option) => (
                            <li
                                key={option}
                                className={cn(
                                    value?.includes(option) && styles.active
                                )}
                            >
                                <button onClick={() => handleSelect(option)}>
                                    <span>{option}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default ChipsSelect
