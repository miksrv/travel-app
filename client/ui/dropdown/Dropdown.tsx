import React, { useEffect, useRef, useState } from 'react'

import Icon from '@/ui/icon'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

type DropdownOptions = {
    key: string | number
    value: React.ReactNode | string | number
}

interface DropdownProps<T> {
    className?: string
    options?: DropdownOptions[]
    disabled?: boolean
    label?: string
    value?: T
    onSelect?: (selectedOption: T) => void
}

const Dropdown: React.FC<DropdownProps<any>> = ({
    className,
    options,
    disabled,
    value,
    label,
    onSelect
}) => {
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
                    <span>{selectedOption?.value ?? 'Выберите опцию'}</span>
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
                                    {option.value}
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
