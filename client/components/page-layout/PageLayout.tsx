import { montserrat } from '@/pages/_app'
import Container from '@mui/material/Container'
import { ContainerTypeMap } from '@mui/material/Container/Container'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import React from 'react'

// import Header from '@/components/header'

export interface PageLayoutProps
    extends OverridableComponent<ContainerTypeMap> {
    children: React.ReactNode
}

const PageLayout: React.FC<any> = ({ children, ...props }) => (
    <Container
        {...props}
        className={montserrat.className}
        component='main'
    >
        {children}
    </Container>
)

export default PageLayout
