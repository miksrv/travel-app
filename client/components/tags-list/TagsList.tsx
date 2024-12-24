import React from 'react'
import Link from 'next/link'
import { Container, ContainerProps } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { ApiModel } from '@/api'

interface TagsListProps extends Pick<ContainerProps, 'title'> {
    tags?: ApiModel.Tag[]
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
