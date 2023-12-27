import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import BasicDatePicker from "../shared/BasicDatePicker";
import BaseAutoComplete from "../shared/BaseAutoComplete";
import TextField from '@mui/material/TextField';

export default function HeaderSearch({
  inputValue,
  setInputValue,
  mfList,
  selectedMFSchemeCode,
  setSelectedMFSchemeCode,
  sipAmount,
  setSipAmount,
  fromSIPDate,
  setFromSIPDate,
  toSIPDate,
  setToSIPDate,
  sellDate,
  setSellDate,
  isMFListLoading,
}) {
  console.log("mfLIST in Search", mfList);
  return (
    <Card sx={{ display: 'flex',width: 1250,justifyContent:'center', padding: '24px',margin: '24px auto', minWidth:1200 }}>
      <BaseAutoComplete
        isMFListLoading={isMFListLoading}
        value={inputValue}
        setInputValue={setInputValue}
        selectedMFSchemeCode={selectedMFSchemeCode}
        setSelectedMFSchemeCode={setSelectedMFSchemeCode}
        mfList={mfList}
      />
      <TextField
        className="custom-text-input-class"
        type={"number"}
        label="Enter your amount"
        value={sipAmount}
        onChange={(e) => {
          console.log("e",e.target.value);
          if(e.target.value)
          setSipAmount(Number(e.target.value))
          setSipAmount((e.target.value))
        }}
      />
      <BasicDatePicker
        value={fromSIPDate}
        label="From SIP date"
        onChange={(date) => {
          console.log("date", new Date(date));
          setFromSIPDate(new Date(date));
        }}
      />
      <BasicDatePicker
        value={toSIPDate}
        label="To SIP date"
        onChange={(date) => {
          console.log("date", new Date(date));
          setToSIPDate(new Date(date));
        }}
      />
      <BasicDatePicker
        value={sellDate}
        label="Sell date"
        onChange={(date) => {
          console.log("date", new Date(date));
          setSellDate(new Date(date));
        }}
      />
      <Button variant="contained" sx={{'borderRadius':'unset'}}>Search MF</Button>
    </Card>
  );
}
