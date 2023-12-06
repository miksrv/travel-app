import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import React from 'react'

const TagsSelector: React.FC = () => (
    <Autocomplete
        sx={{
            '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                padding: '0'
            },
            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                border: '0.5px solid #cbcccd'
            },
            background: '#f7f8fa'
        }}
        multiple={true}
        // getOptionLabel={(option) =>
        //     typeof option === 'string' ? option : option.label
        // }
        // loading={searchLoading}
        filterOptions={(x) => x}
        options={['Пещера', 'Гора', 'Водоем']}
        // options={[
        //     { label: 'Пещера' },
        //     { label: 'Гора' },
        //     { label: 'Водоем' }
        // ]}
        freeSolo={true}
        autoComplete
        includeInputInList
        filterSelectedOptions
        // value={''}
        noOptionsText='Нет найденных локаций'
        // groupBy={(option) => option.label}
        onChange={(event, newValue) => {
            console.log('onChange', newValue)
            // onChangeLocation?.(newValue || undefined)
        }}
        // onInputChange={(event, newInputValue) => {
        //     if (newInputValue !== location?.title) {
        //         setLocationLoading(true)
        //     }
        //
        //     onSearchChange(newInputValue)
        // }}
        // renderOption={(props, option) => (
        //     <li {...props}>
        //         <Typography variant='body1'>
        //             {option.label}
        //         </Typography>
        //     </li>
        // )}
        renderInput={(params: any) => (
            <TextField
                {...params}
                placeholder={'Введите до 20 тегов'}
                variant={'outlined'}
                size={'small'}
                InputProps={{
                    ...params.InputProps
                    // endAdornment: (
                    //     <React.Fragment>
                    //         {searchLoading ||
                    //         locationLoading ? (
                    //             <CircularProgress
                    //                 color='inherit'
                    //                 size={16}
                    //             />
                    //         ) : null}
                    //         {params.InputProps.endAdornment}
                    //     </React.Fragment>
                    // )
                }}
            />
        )}
    />
)

export default TagsSelector
