
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
}) {

  return (
    <div>
      <label>Search MF</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <select value={selectedMFSchemeCode} onChange={(e)=>setSelectedMFSchemeCode(e.target.value)}>
        {mfList.map((listItem, index) => (
          <option
            key={listItem.schemeCode + index + listItem.schemeName}
            value={listItem.schemeCode}
          >
            {listItem.schemeName}
          </option>
        ))}
      </select>
      <label>SIP Amount</label>
      <input
        type="number"
        value={sipAmount}
        onChange={(e) => setSipAmount(e.target.value)}
      />
      <label>From SIP Date</label>
      <input
        type="date"
        value={fromSIPDate}
        onChange={(e) => setFromSIPDate(e.target.value)}
      />
      <label>To SIP Date</label>
      <input
        type="date"
        value={toSIPDate}
        onChange={(e) => setToSIPDate(e.target.value)}
      />
      <label>Sell Date</label>
      <input
        type="date"
        value={sellDate}
        onChange={(e) => setSellDate(e.target.value)}
      />
    </div>
  );
}
