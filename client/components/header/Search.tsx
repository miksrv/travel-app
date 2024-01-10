import React from 'react'

import Icon from '@/ui/icon'

import styles from './styles.module.sass'

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Search: React.FC<SearchProps> = ({ ...props }) => {
    return (
        <div className={styles.searchComponent}>
            <Icon name={'Search'} />
            <input
                {...props}
                type={'text'}
                placeholder={'Поиск...'}
            />
        </div>
    )
}

export default Search
