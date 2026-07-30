import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { ApiModel } from '@/api'

import { ActivityList } from './ActivityList'

jest.mock('simple-react-ui-kit', () => ({
    cn: (...args: string[]) => args.filter(Boolean).join(' '),
    Container: ({ children, className }: any) => <div className={className}>{children}</div>,
    Skeleton: ({ style }: any) => (
        <div
            data-testid={'skeleton'}
            style={style}
        />
    )
}))

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, unknown>) => opts?.defaultValue ?? key
    })
}))

jest.mock('next/dynamic', () => () => {
    const MockPhotoLightbox = ({ showLightbox, photoIndex, photos }: any) =>
        showLightbox ? (
            <div
                data-testid={'photo-lightbox'}
                data-photo-index={photoIndex}
                data-photo-ids={photos?.map((photo: any) => photo.id).join(',')}
            />
        ) : null
    MockPhotoLightbox.displayName = 'MockPhotoLightbox'
    return MockPhotoLightbox
})

jest.mock('./ActivityListItem', () => ({
    ActivityListItem: ({ item, title, onPhotoClick }: any) => (
        <div
            data-testid={'activity-list-item'}
            data-title={title}
        >
            {item.type}
            <button onClick={() => onPhotoClick?.(1)}>{`open-photo-${item.place.id}`}</button>
        </div>
    )
}))

jest.mock('./ActivityListItemLoader', () => ({
    ActivityListItemLoader: () => <div data-testid={'activity-loader'} />
}))

const mockActivities: ApiModel.Activity[] = [
    {
        type: 'place',
        place: { id: 'p1', title: 'Place 1', lat: 0, lon: 0 },
        photos: [{ id: 'a1', full: '/a1-full.jpg', preview: '/a1-prev.jpg', title: 'A1', width: 800, height: 600 }]
    },
    {
        type: 'photo',
        place: { id: 'p2', title: 'Place 2', lat: 0, lon: 0 },
        photos: [{ id: 'b1', full: '/b1-full.jpg', preview: '/b1-prev.jpg', title: 'B1', width: 800, height: 600 }]
    }
]

describe('ActivityList', () => {
    describe('rendering', () => {
        it('renders activity items when activities are provided', () => {
            render(<ActivityList activities={mockActivities} />)
            expect(screen.getAllByTestId('activity-list-item')).toHaveLength(2)
        })

        it('renders the title when title prop is provided', () => {
            render(
                <ActivityList
                    activities={mockActivities}
                    title={'Latest Activity'}
                />
            )
            expect(screen.getByRole('heading', { name: 'Latest Activity' })).toBeInTheDocument()
        })

        it('renders empty state when no activities and not loading', () => {
            render(<ActivityList />)
            expect(screen.getByText('Тут пока ничего нет')).toBeInTheDocument()
        })

        it('does not render empty state when loading', () => {
            render(<ActivityList loading={true} />)
            expect(screen.queryByText('Тут пока ничего нет')).not.toBeInTheDocument()
        })

        it('renders the loader when loading is true', () => {
            render(<ActivityList loading={true} />)
            expect(screen.getByTestId('activity-loader')).toBeInTheDocument()
        })

        it('does not render the loader when loading is false', () => {
            render(
                <ActivityList
                    loading={false}
                    activities={mockActivities}
                />
            )
            expect(screen.queryByTestId('activity-loader')).not.toBeInTheDocument()
        })

        it('renders empty state when activities is an empty array and not loading', () => {
            render(<ActivityList activities={[]} />)
            expect(screen.getByText('Тут пока ничего нет')).toBeInTheDocument()
        })
    })

    describe('lightbox', () => {
        it('renders a single shared lightbox that stays closed until a photo is clicked', () => {
            render(<ActivityList activities={mockActivities} />)
            expect(screen.queryByTestId('photo-lightbox')).not.toBeInTheDocument()
        })

        it('opens the shared lightbox with the clicked item photos and index', () => {
            render(<ActivityList activities={mockActivities} />)
            fireEvent.click(screen.getByText('open-photo-p2'))

            const lightboxes = screen.getAllByTestId('photo-lightbox')
            expect(lightboxes).toHaveLength(1)
            expect(lightboxes[0]).toHaveAttribute('data-photo-index', '1')
            expect(lightboxes[0]).toHaveAttribute('data-photo-ids', 'b1')
        })

        it('switches the shared lightbox to another item photos on subsequent clicks', () => {
            render(<ActivityList activities={mockActivities} />)
            fireEvent.click(screen.getByText('open-photo-p2'))
            fireEvent.click(screen.getByText('open-photo-p1'))

            const lightboxes = screen.getAllByTestId('photo-lightbox')
            expect(lightboxes).toHaveLength(1)
            expect(lightboxes[0]).toHaveAttribute('data-photo-ids', 'a1')
        })
    })
})
