'use client'

// import MenuIcon from '@mui/icons-material/Menu'
import {
    AccountCircleOutlined,
    NotificationsOutlined
} from '@mui/icons-material'
import { SearchOutlined } from '@mui/icons-material'
import { Badge, IconButton } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
// import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useEffect } from 'react'

import { API } from '@/api/api'
import {
    getStorageToken,
    login,
    logout,
    setUserAuth,
    setUserInfo
} from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import LoginForm from '@/components/login-form'

const Search = styled('div')(({ theme }) => ({
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25)
    },
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    borderRadius: theme.shape.borderRadius,
    marginLeft: 0,
    position: 'relative',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto'
    }
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
    alignItems: 'center',
    color: '#818c99',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    padding: theme.spacing(0, 2),
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 1
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        backgroundColor: '#edeef0',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            '&:focus': {
                width: '30ch'
            },
            width: '20ch'
        }
    },
    color: 'inherit'
}))

interface HeaderProps {
    onMenuClick?: (event: React.KeyboardEvent | React.MouseEvent) => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const [authGetMe, { data: meData, error }] = API.useAuthGetMeMutation()

    const [open, setOpen] = React.useState(false)
    const authSlice = useAppSelector((state) => state.auth)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        if (meData?.auth) {
            dispatch(login(meData))
        } else {
            if (error) {
                dispatch(logout())
            }
        }
    }, [meData, error])

    useEffect(() => {
        if (authSlice.token) {
            authGetMe()
        }
    }, [])

    return (
        <AppBar
            position='static'
            sx={{ boxShadow: 0, mb: 2 }}
        >
            <Container
                disableGutters={true}
                maxWidth={false}
                sx={{ maxWidth: '1100px' }}
            >
                <Toolbar
                    sx={{ minHeight: '54px !important', ml: '8px', mr: '8px' }}
                >
                    {/*<IconButton*/}
                    {/*    sx={{ fontSize: 2 }}*/}
                    {/*    edge='start'*/}
                    {/*    color='inherit'*/}
                    {/*    aria-label='open drawer'*/}
                    {/*    onClick={onMenuClick}*/}
                    {/*>*/}
                    {/*    <MenuIcon />*/}
                    {/*</IconButton>*/}
                    <Typography
                        variant='h6'
                        noWrap
                        component='div'
                        sx={{
                            display: { sm: 'block', xs: 'none' },
                            flexGrow: 1
                        }}
                    >
                        {t('Интересно')}
                    </Typography>
                    <Search sx={{ mr: 1.5 }}>
                        <SearchIconWrapper>
                            <SearchOutlined />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder='Поиск…'
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                    <IconButton
                        size='large'
                        aria-label='show 17 new notifications'
                        color='inherit'
                    >
                        <Badge
                            badgeContent={17}
                            color='error'
                        >
                            <NotificationsOutlined />
                        </Badge>
                    </IconButton>
                    <IconButton
                        size='large'
                        edge='end'
                        aria-label='account of current user'
                        // aria-controls={menuId}
                        aria-haspopup='true'
                        onClick={handleClickOpen}
                        color='inherit'
                    >
                        <AccountCircleOutlined />
                    </IconButton>
                </Toolbar>
            </Container>

            <Dialog
                onClose={handleClose}
                open={open}
            >
                <DialogTitle>{'Авторизация на сайте'}</DialogTitle>

                <LoginForm />

                <List sx={{ width: '400px' }}>
                    <ListItem disableGutters>
                        <ListItemButton>
                            <ListItemText primary='Add account' />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Dialog>
        </AppBar>
    )
}

export default Header
