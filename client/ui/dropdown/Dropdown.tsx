import Image, { StaticImageData } from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import OptionsList from '@/ui/dropdown/OptionsList'
import Icon from '@/ui/icon'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

export type DropdownOption = {
    key: string | number
    value: React.ReactNode | string | number
    image?: StaticImageData
}

interface DropdownProps<T> {
    className?: string
    options?: DropdownOption[]
    disabled?: boolean
    clearable?: boolean
    placeholder?: string
    label?: string
    error?: string
    value?: T
    onSelect?: (selectedOption: DropdownOption | undefined) => void
    onOpen?: () => void
}

const Dropdown: React.FC<DropdownProps<any>> = (props) => {
    const {
        className,
        options,
        disabled,
        clearable,
        value,
        placeholder,
        label,
        error,
        onSelect,
        onOpen
    } = props

    const dropdownRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [selectedOption, setSelectedOption] = useState<
        DropdownOption | undefined
    >(undefined)

    const toggleDropdown = () => {
        if (onOpen) {
            onOpen?.()
        } else {
            setIsOpen(!isOpen)
        }
    }

    const handleSelect = (option: DropdownOption | undefined) => {
        if (selectedOption?.key !== option?.key) {
            setSelectedOption(option)
            onSelect?.(option ?? undefined)
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
        } else {
            setSelectedOption(value)
        }
    }, [value])

    return (
        <div
            ref={dropdownRef}
            className={cn(className, styles.dropdown, error && styles.error)}
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
                        {selectedOption?.image && (
                            <Image
                                className={styles.categoryIcon}
                                src={selectedOption.image.src}
                                alt={''}
                                width={22}
                                height={26}
                            />
                        )}
                        {selectedOption?.value ?? (
                            <span className={styles.placeHolder}>
                                {placeholder ?? 'Выберите опцию'}
                            </span>
                        )}
                    </span>
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
                        {isOpen ? <Icon name={'Up'} /> : <Icon name={'Down'} />}
                    </span>
                </button>
                {isOpen && (
                    <OptionsList
                        options={options}
                        selectedOption={selectedOption}
                        onSelect={handleSelect}
                    />
                )}
            </div>
        </div>
    )
}

export default Dropdown
