import React from 'react'

import { render, screen } from '@testing-library/react'

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

describe('Search', () => {
    describe('rendering', () => {
        it('renders the autocomplete input', () => {
            render(<Search />)
            expect(screen.getByTestId('autocomplete')).toBeInTheDocument()
        })

        it('renders with the correct placeholder text', () => {
            render(<Search />)
            expect(screen.getByPlaceholderText('Поиск мест, координат')).toBeInTheDocument()
        })
    })
})
