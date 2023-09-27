import {
    ArticleOutlined,
    BookmarkBorderOutlined,
    Home,
    LabelOutlined,
    MapOutlined,
    PeopleOutline,
    PhotoOutlined,
    PlaceOutlined,
    TerrainOutlined
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ContainerTypeMap } from '@mui/material/Container/Container'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Grid from '@mui/material/Unstable_Grid2'
import React from 'react'

import Header from '@/components/header'

export interface PageLayoutProps
    extends OverridableComponent<ContainerTypeMap> {
    children: React.ReactNode
}

const PageLayout: React.FC<any> = ({ children, ...props }) => {
    const [state, setState] = React.useState<boolean>(false)

    const toggleDrawer =
        (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
            if (
                event &&
                event.type === 'keydown' &&
                ((event as React.KeyboardEvent).key === 'Tab' ||
                    (event as React.KeyboardEvent).key === 'Shift')
            ) {
                return
            }

            setState(open)
        }

    return (
        <>
            <SwipeableDrawer
                anchor={'left'}
                open={state}
                onClose={toggleDrawer(false)}
                onOpen={toggleDrawer(true)}
            >
                <Box
                    sx={{
                        width: 250
                    }}
                    role='presentation'
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton href={'/'}>
                                <ListItemIcon>
                                    <Home />
                                </ListItemIcon>
                                <ListItemText primary={'Главная'} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton href={'/map'}>
                                <ListItemIcon>
                                    <MapOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Карта'} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton href={'/places'}>
                                <ListItemIcon>
                                    <PlaceOutlined />
                                </ListItemIcon>
                                <ListItemText primary={'Места'} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon></ListItemIcon>
                                <ListItemText primary={'Выйти'} />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </SwipeableDrawer>
            <Header onMenuClick={toggleDrawer(true)} />
            <Container
                {...props}
                component='main'
            >
                <Grid
                    container
                    spacing={2}
                >
                    <Grid lg={2}>
                        <div>
                            <ArticleOutlined color={'primary'} /> Лента
                            активностей
                        </div>
                        <div>
                            <TerrainOutlined color={'primary'} /> Интересные
                            места
                        </div>
                        <div>
                            <PlaceOutlined color={'primary'} /> Населенные
                            пункты
                        </div>
                        <div>
                            <MapOutlined color={'primary'} /> Карта мест
                        </div>
                        <div>
                            <LabelOutlined color={'primary'} /> Метки мест
                        </div>
                        <div>
                            <PhotoOutlined color={'primary'} /> Фотографии
                        </div>
                        <div>
                            <BookmarkBorderOutlined color={'primary'} />{' '}
                            Категории
                        </div>
                        <div>
                            <PeopleOutline color={'primary'} /> Пользователи
                        </div>
                    </Grid>
                    <Grid lg={10}>{children}</Grid>
                </Grid>
            </Container>
        </>
    )
}

export default PageLayout
