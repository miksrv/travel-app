import React from 'react'
import Link from 'next/link'
import { Container, ContainerProps } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { Tag } from '@/api/types/Tag'

interface TagsListProps extends Pick<ContainerProps, 'title'> {
    tags?: Tag[]
}

const TagsList: React.FC<TagsListProps> = ({ tags, ...props }) => (
    <Container
        {...props}
        className={styles.tagsList}
    >
        {tags?.map((tag) => (
            <Link
                key={`category${tag.title}`}
                href={`/places?tag=${tag.title}`}
                title={tag.title}
            >
                {tag.title} ({tag.count})
            </Link>
        ))}
    </Container>
)

export default TagsList
