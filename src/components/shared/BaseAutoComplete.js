
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

export default function BaseAutoComplete({isMFListLoading,value,setInputValue,mfList,setSelectedMFSchemeCode}) {
  return (

    <Autocomplete
      id="asynchronous-demo"
      sx={{ width: 300 }}
      open={isMFListLoading}
      isOptionEqualToValue={(option, value) => option.schemeCode === value.schemeCode}
      getOptionLabel={(option) => option.schemeName}
      onChange={(event,value)=>{
        if(value)
        setSelectedMFSchemeCode(value.schemeCode);
        console.log("Autocomplete change",value)
      }}
      options={mfList}
      loading={isMFListLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Mutual Fund"
          onChange={(event) => {
            console.log("Autocomplete",event.target.value)
            setInputValue(event.target.value);
          }}
          value={value}
          className="custom-text-input-class"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isMFListLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
