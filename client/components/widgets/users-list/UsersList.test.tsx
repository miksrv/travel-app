import React from 'react'

import { render, screen } from '@testing-library/react'

import { ApiModel } from '@/api'

import { UsersList } from './UsersList'

jest.mock('simple-react-ui-kit', () => ({
    cn: (...args: string[]) => args.filter(Boolean).join(' '),
    Container: ({
        children,
        className,
        footer
    }: {
        children?: React.ReactNode
        className?: string
        footer?: React.ReactNode
    }) => (
        <div className={className}>
            {children}
            {footer}
        </div>
    ),
    Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />
}))

jest.mock('next/image', () => {
    const Image = ({
        src,
        alt,
        width,
        height,
        className
    }: {
        src?: string
        alt?: string
        width?: number
        height?: number
        className?: string
    }) => (
        // eslint-disable-next-line next/no-img-element
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
        />
    )
    Image.displayName = 'Image'
    return Image
})

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) => opts?.defaultValue ?? key
    })
}))

jest.mock('@/components/ui', () => ({
    Reputation: ({ value }: { value: number }) => <span data-testid={'reputation'}>{value}</span>
}))

jest.mock('@/utils/levels', () => ({
    levelColor: jest.fn().mockReturnValue('#aabbcc'),
    levelColors: jest.fn().mockReturnValue({ border: '#334455', fill: '#aabbcc' }),
    nextLevelPercentage: jest.fn().mockReturnValue(50)
}))

jest.mock('@/components/shared/level-badge/LevelBadge', () => ({
    LevelBadge: ({ level }: any) => <span data-testid={'level-badge'}>{level}</span>
}))

jest.mock('@/components/shared/level-progress/LevelProgress', () => ({
    LevelProgress: ({ levelData }: any) => (
        <div data-testid={'level-progress'}>
            <span data-testid={'level-number'}>{levelData?.level}</span>
        </div>
    )
}))

jest.mock('@/components/shared/user-avatar', () => ({
    UserAvatar: ({ user, showName, caption }: { user?: ApiModel.User; showName?: boolean; caption?: string }) => (
        <div data-testid={'user-avatar'}>
            {user?.name}
            {showName && <span data-testid={'user-name-shown'}>{user?.name}</span>}
            {caption && <span data-testid={'user-caption'}>{caption}</span>}
        </div>
    )
}))

const mockUsers: ApiModel.User[] = [
    {
        id: 'u1',
        name: 'Alice',
        reputation: 100,
        levelData: { level: 3, title: 'Explorer', experience: 300, nextLevel: 500 }
    },
    {
        id: 'u2',
        name: 'Bob',
        reputation: 50,
        levelData: { level: 2, title: 'Traveler', experience: 150, nextLevel: 300 }
    }
]

describe('UsersList', () => {
    describe('rendering with users', () => {
        it('renders a UserAvatar for each user', () => {
            render(<UsersList users={mockUsers} />)
            expect(screen.getAllByTestId('user-avatar')).toHaveLength(2)
        })

        it('renders user names', () => {
            render(<UsersList users={mockUsers} />)
            expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
            expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
        })

        it('renders Reputation component for each user', () => {
            render(<UsersList users={mockUsers} />)
            expect(screen.getAllByTestId('reputation')).toHaveLength(2)
        })

        it('renders reputation values', () => {
            render(<UsersList users={mockUsers} />)
            expect(screen.getByText('100')).toBeInTheDocument()
            expect(screen.getByText('50')).toBeInTheDocument()
        })

        it('renders LevelProgress for each user', () => {
            render(<UsersList users={mockUsers} />)
            expect(screen.getAllByTestId('level-progress')).toHaveLength(2)
        })

        it('renders level numbers', () => {
            render(<UsersList users={mockUsers} />)
            expect(screen.getAllByText('3').length).toBeGreaterThan(0)
            expect(screen.getAllByText('2').length).toBeGreaterThan(0)
        })

        it('renders the title when title prop is provided', () => {
            render(
                <UsersList
                    users={mockUsers}
                    title={'Active travelers'}
                />
            )
            expect(screen.getByRole('heading', { name: 'Active travelers' })).toBeInTheDocument()
        })

        it('renders the action link when actionHref and actionLabel are provided', () => {
            render(
                <UsersList
                    users={mockUsers}
                    actionHref={'/users'}
                    actionLabel={'All'}
                />
            )
            expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('href', '/users')
        })
    })

    describe('empty state', () => {
        it('renders empty state message when no users', () => {
            render(<UsersList />)
            expect(screen.getByText('Тут пока ничего нет')).toBeInTheDocument()
        })

        it('renders empty state when users is empty array', () => {
            render(<UsersList users={[]} />)
            expect(screen.getByText('Тут пока ничего нет')).toBeInTheDocument()
        })
    })
})
