import React from 'react'

import Container from '@/ui/container'

import { User } from '@/api/types/User'

import UsersListItem from './UsersListItem'

interface UsersListProps {
    users?: User[]
}

const UsersList: React.FC<UsersListProps> = ({ users }) => (
    <Container>
        {users?.map((place) => (
            <UsersListItem
                key={place.id}
                user={place}
            />
        ))}
    </Container>
)

export default UsersList
