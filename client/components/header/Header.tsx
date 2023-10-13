'use client'

// import MenuIcon from '@mui/icons-material/Menu'
import {
    AccountCircleOutlined,
    NotificationsOutlined
} from '@mui/icons-material'
import SearchIcon from '@mui/icons-material/Search'
import { Badge, IconButton } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
// import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import React from 'react'

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
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    padding: theme.spacing(0, 2),
    pointerEvents: 'none',
    position: 'absolute'
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            '&:focus': {
                width: '20ch'
            },
            width: '12ch'
        }
    },
    color: 'inherit'
}))

interface HeaderProps {
    onMenuClick?: (event: React.KeyboardEvent | React.MouseEvent) => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { t } = useTranslation()

    return (
        <AppBar
            position='static'
            sx={{ boxShadow: 0, mb: 2 }}
        >
            <Container
                maxWidth='lg'
                disableGutters
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
                    <Search sx={{ mr: 2 }}>
                        <SearchIconWrapper>
                            <SearchIcon />
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
                        // onClick={handleProfileMenuOpen}
                        color='inherit'
                    >
                        <AccountCircleOutlined />
                    </IconButton>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default Header
