import { Button } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import React, { useEffect } from 'react'
import Markdown from 'react-markdown'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { Address, Tag } from '@/api/types/Place'

import ContentEditor from '@/components/content-editor'

interface PlaceTabDescriptionProps {
    id?: string
    title?: string
    address?: Address
    content?: string
    tags?: Tag[]
}

const PlaceTabDescription: React.FC<PlaceTabDescriptionProps> = (props) => {
    const { id, title, address, content, tags } = props

    const [savePlace, { isLoading, data: saveData }] =
        API.usePlacesPatchItemMutation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)
    const [editorMode, setEditorMode] = React.useState<boolean>(false)
    const [editorContent, setEditorContent] = React.useState<string>()

    const handleSetEditorClick = () => {
        setEditorMode(!editorMode)
    }

    const handleSaveEditorClick = async () => {
        if (!id || !editorContent) {
            setEditorMode(false)
            return
        }

        await savePlace({
            content: editorContent,
            id
        })
    }

    useEffect(() => {
        if (saveData?.status && editorMode) {
            setEditorMode(false)
            setEditorContent(undefined)
        }
    }, [saveData])

    return (
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
                action={
                    isAuth && editorMode ? (
                        <>
                            <Button
                                sx={{ mr: 1 }}
                                size={'medium'}
                                variant={'contained'}
                                disabled={isLoading}
                                onClick={handleSaveEditorClick}
                            >
                                {'Сохранить'}
                            </Button>
                            <Button
                                sx={{ mr: 0 }}
                                size={'medium'}
                                variant={'outlined'}
                                disabled={isLoading}
                                onClick={handleSetEditorClick}
                            >
                                {'Отмена'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            sx={{ mr: 0 }}
                            size={'medium'}
                            variant={'contained'}
                            disabled={!isAuth}
                            onClick={handleSetEditorClick}
                        >
                            {'Редактировать'}
                        </Button>
                    )
                }
            />
            <CardContent sx={{ mt: -3 }}>
                {isAuth && editorMode ? (
                    <ContentEditor
                        markdown={content || ''}
                        onChange={setEditorContent}
                    />
                ) : (
                    <Typography
                        variant={'body2'}
                        className={'placeContent'}
                        sx={{ whiteSpace: 'break-spaces' }}
                    >
                        {content ? (
                            <Markdown>{content}</Markdown>
                        ) : (
                            'Нет данных для отображения'
                        )}
                    </Typography>
                )}

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
}

export default PlaceTabDescription
