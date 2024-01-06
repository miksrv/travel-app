import Link from 'next/link'
import React, { useEffect } from 'react'
import Markdown from 'react-markdown'

import Button from '@/ui/button'
import Container from '@/ui/container'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { Address, Tag } from '@/api/types/Place'

import TagsSelector from '@/components/form-controllers/tags-selector'

import ContentEditor from '../form-controllers/content-editor'
import styles from './styles.module.sass'

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
    const [editorTags, setEditorTags] = React.useState<string[]>()

    const handleSetEditorClick = () => {
        setEditorMode(!editorMode)
    }

    const handleSaveEditorClick = async () => {
        if (!id) {
            return
        }

        setEditorMode(false)

        await savePlace({
            content: editorContent,
            id,
            tags: editorTags
        })
    }

    useEffect(() => {
        if (saveData?.status && editorMode) {
            setEditorMode(false)
            setEditorContent(undefined)
        }
    }, [saveData])

    useEffect(() => {
        setEditorTags(tags?.map(({ title }) => title))
    }, [tags])

    return (
        <Container
            className={styles.component}
            title={`Описание: ${title}`}
            action={<Button icon={'Camera'}>{'Редактировать'}</Button>}
        >
            <Markdown>{content}</Markdown>
            {!!tags?.length && (
                <ul className={styles.tagList}>
                    {tags?.map((tag) => (
                        <li key={tag.id}>
                            <Link href={`/tags/${tag.id}`}>
                                {`#${tag.title}`}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {/*<CardHeader*/}
            {/*    title={title ? `${title} - описание` : title}*/}
            {/*    titleTypographyProps={{*/}
            {/*        component: 'h2',*/}
            {/*        fontSize: 18*/}
            {/*    }}*/}
            {/*    sx={{ mb: -2 }}*/}
            {/*    subheader={*/}
            {/*        <Typography variant={'caption'}>*/}
            {/*            {address?.country && (*/}
            {/*                <Link*/}
            {/*                    color='inherit'*/}
            {/*                    href={`/country/${address.country.id}`}*/}
            {/*                >*/}
            {/*                    {address.country.name}*/}
            {/*                </Link>*/}
            {/*            )}*/}
            {/*            {address?.region && (*/}
            {/*                <>*/}
            {/*                    {address?.country && ', '}*/}
            {/*                    <Link*/}
            {/*                        color='inherit'*/}
            {/*                        href={`/region/${address.region.id}`}*/}
            {/*                    >*/}
            {/*                        {address.region.name}*/}
            {/*                    </Link>*/}
            {/*                </>*/}
            {/*            )}*/}
            {/*            {address?.district && (*/}
            {/*                <>*/}
            {/*                    {address?.region && ', '}*/}
            {/*                    <Link*/}
            {/*                        color='inherit'*/}
            {/*                        href={`/district/${address.district.id}`}*/}
            {/*                    >*/}
            {/*                        {address.district.name}*/}
            {/*                    </Link>*/}
            {/*                </>*/}
            {/*            )}*/}
            {/*            {address?.city && (*/}
            {/*                <>*/}
            {/*                    {address?.district && ', '}*/}
            {/*                    <Link*/}
            {/*                        color='inherit'*/}
            {/*                        href={`/city/${address.city.id}`}*/}
            {/*                    >*/}
            {/*                        {address.city.name}*/}
            {/*                    </Link>*/}
            {/*                </>*/}
            {/*            )}*/}
            {/*            {address?.street && (*/}
            {/*                <>*/}
            {/*                    {', '}*/}
            {/*                    {address?.street}*/}
            {/*                </>*/}
            {/*            )}*/}
            {/*        </Typography>*/}
            {/*    }*/}
            {/*    action={*/}
            {/*        isAuth && editorMode ? (*/}
            {/*            <>*/}
            {/*                <Button*/}
            {/*                    sx={{ mr: 1 }}*/}
            {/*                    size={'medium'}*/}
            {/*                    variant={'contained'}*/}
            {/*                    disabled={isLoading}*/}
            {/*                    onClick={handleSaveEditorClick}*/}
            {/*                >*/}
            {/*                    {'Сохранить'}*/}
            {/*                </Button>*/}
            {/*                <Button*/}
            {/*                    sx={{ mr: 0 }}*/}
            {/*                    size={'medium'}*/}
            {/*                    variant={'outlined'}*/}
            {/*                    disabled={isLoading}*/}
            {/*                    onClick={handleSetEditorClick}*/}
            {/*                >*/}
            {/*                    {'Отмена'}*/}
            {/*                </Button>*/}
            {/*            </>*/}
            {/*        ) : (*/}
            {/*            <Button*/}
            {/*                sx={{ mr: 0 }}*/}
            {/*                size={'medium'}*/}
            {/*                variant={'contained'}*/}
            {/*                disabled={!isAuth}*/}
            {/*                onClick={handleSetEditorClick}*/}
            {/*            >*/}
            {/*                {'Редактировать'}*/}
            {/*            </Button>*/}
            {/*        )*/}
            {/*    }*/}
            {/*/>*/}
            {/*<CardContent sx={{ mt: -3 }}>*/}
            {/*    {isAuth && editorMode ? (*/}
            {/*        <ContentEditor*/}
            {/*            markdown={content || ''}*/}
            {/*            onChange={setEditorContent}*/}
            {/*        />*/}
            {/*    ) : (*/}
            {/*        <Typography*/}
            {/*            variant={'body2'}*/}
            {/*            className={'placeContent'}*/}
            {/*            sx={{ whiteSpace: 'break-spaces' }}*/}
            {/*        >*/}
            {/*            {content ? (*/}
            {/*                <Markdown>{content}</Markdown>*/}
            {/*            ) : (*/}
            {/*                'Нет данных для отображения'*/}
            {/*            )}*/}
            {/*        </Typography>*/}
            {/*    )}*/}

            {/*    {isAuth && editorMode ? (*/}
            {/*        <TagsSelector*/}
            {/*            onChangeTags={setEditorTags}*/}
            {/*            tags={editorTags}*/}
            {/*        />*/}
            {/*    ) : tags?.length ? (*/}
            {/*        <Stack*/}
            {/*            direction='row'*/}
            {/*            spacing={1}*/}
            {/*            sx={{ mb: -1, mt: 1 }}*/}
            {/*        >*/}
            {/*            {tags.map((tag) => (*/}
            {/*                <Link*/}
            {/*                    key={tag.id}*/}
            {/*                    color={'inherit'}*/}
            {/*                    href={`/tags/${tag.id}`}*/}
            {/*                >*/}
            {/*                    {`#${tag.title}`}*/}
            {/*                </Link>*/}
            {/*            ))}*/}
            {/*        </Stack>*/}
            {/*    ) : (*/}
            {/*        ''*/}
            {/*    )}*/}
            {/*</CardContent>*/}
        </Container>
    )
}

export default PlaceTabDescription
