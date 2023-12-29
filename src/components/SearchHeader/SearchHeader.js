import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import BasicDatePicker from "../shared/BasicDatePicker";
import BaseAutoComplete from "../shared/BaseAutoComplete";
import TextField from "@mui/material/TextField";
import { useEffect, useState,memo } from "react";
import { useDeBounce } from "../../hooks/useDebounce";

export default memo(function HeaderSearch({ onSearchHandler }) {
  const [inputValue, setInputValue] = useState("");
  const seachedMF = useDeBounce(inputValue, 1000);
  const [mfList, setMfList] = useState([]);
  const [selectedMFScheme, setSelectedMFScheme] = useState({
    schemeCode: "",
    schemeName: "",
  });
  const [fromSIPDate, setFromSIPDate] = useState(null);
  const [toSIPDate, setToSIPDate] = useState(null);
  const [sellDate, setSellDate] = useState(null);
  const [amount, setAmount] = useState("");
  const [isMFListLoading, setIsMFListLoading] = useState(false);

  useEffect(() => {
    let isLoading = true;
    setIsMFListLoading(true);
    async function fetchData() {
      let response = await fetch(
        `https://api.mfapi.in/mf/search?q=${seachedMF}`
      );
      let mfData = await response.json();
      isLoading = false;
      return mfData;
    }
    fetchData().then((mfData) => {
      if (!isLoading) {
        setIsMFListLoading(false);
        setMfList(mfData);
        console.log("mfDATA", mfData);
        // if (mfData[0]) {
        //   setSelectedMFScheme(mfData[0]);
        //   console.log("mfData[0].schemeCode", mfData[0]);
        // }
      }
    });

    return () => {
      isLoading = false;
      setIsMFListLoading(false);
    };
  }, [seachedMF]);
  console.log("mfLIST in Search", mfList);
  return (
    <Card
      sx={{
        display: "flex",
        width: 1250,
        justifyContent: "center",
        padding: "24px",
        margin: "24px auto",
        minWidth: 1200,
      }}
    >
      <BaseAutoComplete
        value={inputValue}
        inputValue={inputValue}
        setInputValue={setInputValue}
        setSelectedMFScheme={setSelectedMFScheme}
        selectedMFScheme={selectedMFScheme}
        mfList={mfList}
        isMFListLoading={isMFListLoading}
      />
      <TextField
        className="custom-text-input-class"
        type={"number"}
        label="Enter your amount"
        value={amount}
        onChange={(e) => {
          console.log("e", e.target.value);
          if (e.target.value) setAmount(Number(e.target.value));
          setAmount(e.target.value);
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
      <Button
        variant="contained"
        sx={{ borderRadius: "unset" }}
        onClick={() =>
          onSearchHandler({
            amount,
            mfList,
            selectedMFScheme,
            fromSIPDate,
            toSIPDate,
            sellDate,
          })
        }
      >
        Search MF
      </Button>
    </Card>
  );
}
)