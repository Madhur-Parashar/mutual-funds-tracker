import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";

export default function BaseAutoComplete({
  isMFListLoading,
  setInputValue,
  mfList,
  inputValue,
  setSelectedMFScheme,
  selectedMFScheme = {
    schemeCode: null,
    schemeName: null,
  },
}) {
  console.log("mfLIST in Auto", mfList,isMFListLoading,selectedMFScheme,inputValue);
  return (
    <Autocomplete
      id="asynchronous-demo"
      sx={{ width: 300 }}
      isOptionEqualToValue={(option, value) =>
        option.schemeCode === value.schemeCode
      }
      getOptionLabel={(option) => option.schemeName}
      options={mfList}
      loading={isMFListLoading}
      value={selectedMFScheme}
      onChange={(event, value) => {
        console.log("Autocomplete change", value, event.target.value);
        setSelectedMFScheme(value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Mutual Fund"
          className="custom-text-input-class"
          value={inputValue}
          onChange={(event, newInputValue) => {
            console.log("Autocomplete change", event.target.value);
            setInputValue(event.target.value);
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isMFListLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
