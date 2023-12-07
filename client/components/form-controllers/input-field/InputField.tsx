import InputBase from '@mui/material/InputBase'
import { alpha, styled } from '@mui/material/styles'

const InputField = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
        '&:focus': {
            borderColor: theme.palette.primary.main,
            boxShadow: `${alpha(
                theme.palette.primary.main,
                0.25
            )} 0 0 0 0.05rem`
        },
        backgroundColor: theme.palette.mode === 'light' ? '#f7f8fa' : '#1A2027',
        border: '0.5px solid',
        borderColor: theme.palette.mode === 'light' ? '#cbcccd' : '#2D3843',
        borderRadius: 6,
        fontSize: 14,
        padding: '8px 12px',
        position: 'relative',
        transition: theme.transitions.create([
            'border-color',
            'background-color',
            'box-shadow'
        ])
    },
    'label + &': {
        marginTop: theme.spacing(2.5)
    }
}))

export default InputField
