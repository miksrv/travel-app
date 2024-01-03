'use client'

// import MenuIcon from '@mui/icons-material/Menu'
import {
    AccountCircleOutlined,
    NotificationsOutlined,
    SearchOutlined
} from '@mui/icons-material'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'

import { ImageHost } from '@/api/api'
import { API } from '@/api/api'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

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

const settings = ['Profile', 'Account', 'Dashboard', 'Logout']

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const [authGetMe, { data: meData, error }] = API.useAuthGetMeMutation()

    const authSlice = useAppSelector((state) => state.auth)

    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
        null
    )

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget)
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
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
            position={'static'}
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
                        noWrap={true}
                        variant={'h6'}
                        component={'div'}
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
                            placeholder={'Поиск…'}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>

                    {authSlice.isAuth ? (
                        <Box sx={{ flexGrow: 0 }}>
                            <IconButton
                                size={'large'}
                                aria-label={'show 17 new notifications'}
                                sx={{ mr: 2 }}
                            >
                                <Badge
                                    badgeContent={17}
                                    color={'error'}
                                >
                                    <NotificationsOutlined />
                                </Badge>
                            </IconButton>

                            <Tooltip title={'Open settings'}>
                                <IconButton
                                    onClick={handleOpenUserMenu}
                                    sx={{ p: 0 }}
                                >
                                    <Avatar
                                        alt={authSlice?.user?.name}
                                        src={`${ImageHost}avatar/${authSlice?.user?.avatar}`}
                                        sx={{
                                            height: '32px',
                                            width: '32px'
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id={'menu-appbar'}
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    horizontal: 'right',
                                    vertical: 'top'
                                }}
                                keepMounted
                                transformOrigin={{
                                    horizontal: 'right',
                                    vertical: 'top'
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem
                                        key={setting}
                                        onClick={handleCloseUserMenu}
                                    >
                                        <Typography textAlign={'center'}>
                                            {setting}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    ) : (
                        <IconButton
                            size={'large'}
                            edge={'end'}
                            aria-label={'account of current user'}
                            aria-haspopup={'true'}
                            color={'inherit'}
                            href={'/login'}
                        >
                            <AccountCircleOutlined />
                        </IconButton>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default Header
