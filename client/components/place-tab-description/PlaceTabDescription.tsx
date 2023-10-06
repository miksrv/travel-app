import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import React from 'react'

import { Address, Tag } from '@/api/types/Place'

interface PlaceTabDescriptionProps {
    title?: string
    address?: Address
    content?: string
    tags?: Tag[]
}

const PlaceTabDescription: React.FC<PlaceTabDescriptionProps> = ({
    title,
    address,
    content,
    tags
}) => (
    <>
        <CardHeader
            title={title ? `${title} - описание` : title}
            titleTypographyProps={{
                component: 'h2',
                fontSize: 18
            }}
            sx={{ mb: -2 }}
            subheader={
                <Typography variant={'caption'}>
                    {address?.country && (
                        <Link
                            color='inherit'
                            href={`/country/${address.country.id}`}
                        >
                            {address.country.name}
                        </Link>
                    )}
                    {address?.region && (
                        <>
                            {address?.country && ', '}
                            <Link
                                color='inherit'
                                href={`/region/${address.region.id}`}
                            >
                                {address.region.name}
                            </Link>
                        </>
                    )}
                    {address?.district && (
                        <>
                            {address?.region && ', '}
                            <Link
                                color='inherit'
                                href={`/district/${address.district.id}`}
                            >
                                {address.district.name}
                            </Link>
                        </>
                    )}
                    {address?.city && (
                        <>
                            {address?.district && ', '}
                            <Link
                                color='inherit'
                                href={`/city/${address.city.id}`}
                            >
                                {address.city.name}
                            </Link>
                        </>
                    )}
                    {address?.street && (
                        <>
                            {', '}
                            {address?.street}
                        </>
                    )}
                </Typography>
            }
        />
        <CardContent sx={{ mt: -3 }}>
            <Typography
                variant={'body2'}
                sx={{ whiteSpace: 'break-spaces' }}
            >
                {content ? content : 'Нет данных для отображения'}
            </Typography>

            {!!tags?.length && (
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ mb: -1, mt: 1 }}
                >
                    {tags.map((tag) => (
                        <Link
                            key={tag.id}
                            color={'inherit'}
                            href={`/tags/${tag.id}`}
                        >
                            {`#${tag.title}`}
                        </Link>
                    ))}
                </Stack>
            )}
        </CardContent>
    </>
)

export default PlaceTabDescription
