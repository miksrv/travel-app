import React, { useEffect, useRef, useState } from 'react'

import styles from './styles.module.sass'

interface PaginationProps {
    position?: 'left' | 'right'
    action?: React.ReactNode | string
    children?: React.ReactNode
}

const Popout: React.FC<PaginationProps> = ({ position, action, children }) => {
    const popoutRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation()

        setIsOpen(!isOpen)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (
            popoutRef.current &&
            !popoutRef.current.contains(event.target as Node)
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

    return (
        <div
            ref={popoutRef}
            className={styles.popout}
        >
            <button
                className={styles.trigger}
                onClick={toggleDropdown}
            >
                {action}
            </button>
            {isOpen && (
                <div
                    className={styles.content}
                    style={position === 'left' ? { left: 0 } : { right: 0 }}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

export default Popout
