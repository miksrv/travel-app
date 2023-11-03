import Box from '@mui/material/Box'
import React from 'react'

interface ReputationProps {
    value?: number
}

const Reputation: React.FC<ReputationProps> = ({ value }) => (
    <Box
        sx={{
            background:
                value && value > 0
                    ? 'rgb(46, 125, 50)'
                    : value === 0
                    ? '#CCC'
                    : 'rgb(211, 47, 47)',
            borderRadius: '4px',
            color: '#FFF',
            fontSize: '12px',
            mt: '-1px',
            p: '2px 10px'
        }}
    >
        {value}
    </Box>
)

export default Reputation
