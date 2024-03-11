import Link from 'next/link'
import React from 'react'

import Container, { ContainerProps } from '@/ui/container'

import { Tag } from '@/api/types/Tag'

import styles from './styles.module.sass'

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
