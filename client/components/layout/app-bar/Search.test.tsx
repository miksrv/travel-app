import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { Search } from './Search'

jest.mock('next/router', () => ({
    useRouter: () => ({
        pathname: '/',
        asPath: '/',
        query: {},
        push: jest.fn().mockResolvedValue(true),
        replace: jest.fn().mockResolvedValue(true)
    })
}))

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) => opts?.defaultValue ?? key
    })
}))

jest.mock('@/api', () => ({
    API: {
        useSearchSuggestQuery: jest.fn().mockReturnValue({ data: undefined, isFetching: false })
    },
    ApiType: {}
}))

jest.mock('@/components/ui', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Autocomplete: ({ placeholder, className }: any) => (
        <input
            data-testid={'autocomplete'}
            placeholder={placeholder}
            className={className}
        />
    ),
    AutocompleteOption: {}
}))

jest.mock('simple-react-ui-kit', () => ({
    cn: (...args: string[]) => args.filter(Boolean).join(' '),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Button: ({ onClick, 'aria-label': ariaLabel, children }: any) => (
        <button
            aria-label={ariaLabel}
            onClick={onClick}
        >
            {children}
        </button>
    ),
    Icon: ({ name }: { name: string }) => <svg data-testid={`icon-${name}`} />
}))

describe('Search', () => {
    describe('rendering', () => {
        it('renders the search icon button by default', () => {
            render(<Search />)
            expect(screen.getByRole('button', { name: 'Поиск мест, координат' })).toBeInTheDocument()
        })

        it('shows autocomplete when search button is clicked', () => {
            render(<Search />)
            const searchBtn = screen.getByRole('button', { name: 'Поиск мест, координат' })
            fireEvent.click(searchBtn)
            expect(screen.getByTestId('autocomplete')).toBeInTheDocument()
        })

        it('renders a close button when search is open', () => {
            render(<Search />)
            fireEvent.click(screen.getByRole('button', { name: 'Поиск мест, координат' }))
            expect(screen.getByRole('button', { name: 'Закрыть поиск' })).toBeInTheDocument()
        })

        it('closes overlay when close button is clicked', () => {
            render(<Search />)
            fireEvent.click(screen.getByRole('button', { name: 'Поиск мест, координат' }))
            fireEvent.click(screen.getByRole('button', { name: 'Закрыть поиск' }))
            expect(screen.queryByTestId('autocomplete')).not.toBeInTheDocument()
        })
    })
})
