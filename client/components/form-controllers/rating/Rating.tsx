import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'

interface RatingProps {
    value?: number
    enable?: boolean
    onChange?: (value?: number) => void
}

const Rating: React.FC<RatingProps> = ({ value, enable, onChange }) => {
    const handleRatingUp = () => {
        onChange?.(1)
    }

    const handleRatingDown = () => {
        onChange?.(-1)
    }

    return (
        <Stack
            direction={'row'}
            spacing={1}
            sx={{ mb: 1 }}
        >
            <IconButton
                sx={{ height: '20px', p: '0 !important' }}
                size={'small'}
                disabled={!enable}
                onClick={handleRatingUp}
            >
                <ExpandLessIcon fontSize={'large'} />
            </IconButton>
            <Typography sx={{ lineHeight: '20px' }}>{value ?? 0}</Typography>
            <IconButton
                sx={{ height: '20px', p: '0 !important' }}
                size={'small'}
                disabled={!enable}
                onClick={handleRatingDown}
            >
                <ExpandMoreIcon fontSize={'large'} />
            </IconButton>
        </Stack>
    )
}

export default Rating
