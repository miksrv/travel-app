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
import { Link, MenuList } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ContainerTypeMap } from '@mui/material/Container/Container'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Grid from '@mui/material/Unstable_Grid2'
import React from 'react'

import Header from '@/components/header'

export interface PageLayoutProps
    extends OverridableComponent<ContainerTypeMap> {
    children: React.ReactNode
}

type MenuItemsProps = {
    link: string
    text: string
    icon?: React.ReactNode
}

const menuItems: MenuItemsProps[] = [
    {
        icon: <ArticleOutlined color={'primary'} />,
        link: '/',
        text: 'Лента активностей'
    },
    {
        icon: <TerrainOutlined color={'primary'} />,
        link: '/places',
        text: 'Интересные места'
    },
    // {
    //     icon: <PlaceOutlined color={'primary'} />,
    //     link: '/places',
    //     text: 'Населенные пункты'
    // },
    {
        icon: <MapOutlined color={'primary'} />,
        link: '/map',
        text: 'Карта мест'
    },
    // {
    //     icon: <LabelOutlined color={'primary'} />,
    //     link: '/tags',
    //     text: 'Метки мест'
    // },
    {
        icon: <PhotoOutlined color={'primary'} />,
        link: '/photos',
        text: 'Фотографии'
    },
    // {
    //     icon: <BookmarkBorderOutlined color={'primary'} />,
    //     link: '/categories',
    //     text: 'Категории'
    // },
    {
        icon: <PeopleOutline color={'primary'} />,
        link: '/users',
        text: 'Путешественники'
    }
]

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
            {/*<SwipeableDrawer*/}
            {/*    anchor={'left'}*/}
            {/*    open={state}*/}
            {/*    onClose={toggleDrawer(false)}*/}
            {/*    onOpen={toggleDrawer(true)}*/}
            {/*>*/}
            {/*    <Box*/}
            {/*        sx={{*/}
            {/*            width: 250*/}
            {/*        }}*/}
            {/*        role='presentation'*/}
            {/*        onClick={toggleDrawer(false)}*/}
            {/*        onKeyDown={toggleDrawer(false)}*/}
            {/*    >*/}
            {/*        <List>*/}
            {/*            <ListItem disablePadding>*/}
            {/*                <ListItemButton href={'/'}>*/}
            {/*                    <ListItemIcon>*/}
            {/*                        <Home />*/}
            {/*                    </ListItemIcon>*/}
            {/*                    <ListItemText primary={'Главная'} />*/}
            {/*                </ListItemButton>*/}
            {/*            </ListItem>*/}
            {/*            <ListItem disablePadding>*/}
            {/*                <ListItemButton href={'/map'}>*/}
            {/*                    <ListItemIcon>*/}
            {/*                        <MapOutlined />*/}
            {/*                    </ListItemIcon>*/}
            {/*                    <ListItemText primary={'Карта'} />*/}
            {/*                </ListItemButton>*/}
            {/*            </ListItem>*/}
            {/*            <ListItem disablePadding>*/}
            {/*                <ListItemButton href={'/places'}>*/}
            {/*                    <ListItemIcon>*/}
            {/*                        <PlaceOutlined />*/}
            {/*                    </ListItemIcon>*/}
            {/*                    <ListItemText primary={'Места'} />*/}
            {/*                </ListItemButton>*/}
            {/*            </ListItem>*/}
            {/*        </List>*/}
            {/*        <Divider />*/}
            {/*        <List>*/}
            {/*            <ListItem disablePadding>*/}
            {/*                <ListItemButton>*/}
            {/*                    <ListItemIcon></ListItemIcon>*/}
            {/*                    <ListItemText primary={'Выйти'} />*/}
            {/*                </ListItemButton>*/}
            {/*            </ListItem>*/}
            {/*        </List>*/}
            {/*    </Box>*/}
            {/*</SwipeableDrawer>*/}
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
                        <MenuList>
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.link}
                                    title={item.text}
                                    sx={{
                                        '&:hover': { textDecoration: 'none' },
                                        color: 'rgba(0, 0, 0, 0.87)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <MenuItem sx={{ pl: '5px' }}>
                                        {item.icon && (
                                            <ListItemIcon sx={{ mr: '-10px' }}>
                                                {item.icon}
                                            </ListItemIcon>
                                        )}
                                        {item.text}
                                    </MenuItem>
                                </Link>
                            ))}
                        </MenuList>
                    </Grid>
                    <Grid lg={10}>{children}</Grid>
                </Grid>
            </Container>
        </>
    )
}

export default PageLayout
