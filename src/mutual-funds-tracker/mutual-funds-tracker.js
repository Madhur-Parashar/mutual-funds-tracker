import moment from "moment";

import { useEffect, useState } from "react";
import { useDeBounce } from "../hooks/useDebounce";
import LinkedList from "../utils/linked-list";
import SearchHeader from "../components/SearchHeader/SearchHeader";
// const SIPDATES = Array(28).fill('sip')
const TODAY_DATE = moment();
const LAST_YEAR_DATE = moment().subtract(1, "years");
function MutualFundsTracker() {
  const [inputValue, setInputValue] = useState("");
  const seachedMF = useDeBounce(inputValue, 1000);
  const [mfList, setMfList] = useState([]);
  const [selectedMFSchemeCode, setSelectedMFSchemeCode] = useState("");
  const [historicalNav, setHistoricalNav] = useState([]);
  const [sipAmount, setSipAmount] = useState("");
  const [historicalNavLinkedList, setHistoricalNavLinkedList] = useState(null);
  const [filterHistoricalNav, setFilterHistoricalNav] = useState([]);
  const [fromSIPDate, setFromSIPDate] = useState("");
  const [toSIPDate, setToSIPDate] = useState("");
  const [sellDate, setSellDate] = useState("");

  console.log("seachedMF", seachedMF);
  useEffect(() => {
    let isLoading = true;
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
        setMfList(mfData);
        if (mfData[0]) {
          setSelectedMFSchemeCode(mfData[0].schemeCode);
          console.log("mfData[0].schemeCode", mfData[0].schemeCode);
        }
      }
    });

    return () => {
      isLoading = false;
    };
  }, [seachedMF]);
  const handleSelectListItem = (e) => {
    console.log("e", e.target.value);
    setSelectedMFSchemeCode(e.target.value);
  };
  useEffect(() => {
    let isLoading = true;
    async function fetchHistoricalNav() {
      let response = await fetch(
        `https://api.mfapi.in/mf/${selectedMFSchemeCode}`
      );
      let historicalNav = await response.json();
      isLoading = false;
      if (historicalNav.status === "SUCCESS") {
        return historicalNav.data;
      }
      return [];
    }
    if (selectedMFSchemeCode) {
      fetchHistoricalNav().then((historicalNav) => {
        if (!isLoading) {
          console.log("historicalNav", historicalNav);
          setHistoricalNav(historicalNav);
        }
      });
    }

    return () => {
      isLoading = false;
    };
  }, [selectedMFSchemeCode]);
  useEffect(() => {
    if (historicalNav.length > 0 && fromSIPDate && toSIPDate) {
      let linkedList = new LinkedList();
      historicalNav.forEach((item) => linkedList.insertAtFront(item));
      console.log("linkedList", linkedList);
      setHistoricalNavLinkedList(linkedList);
      let filterHistoricalNavs = [];
      let currentSIPDate = moment(fromSIPDate, "YYYY-MM-DD");
      let ptr = linkedList.head;
      while (ptr.nextPtr !== null) {
        console.log("date", ptr.value.date);
        console.log(
          "currentSIPDate",
          moment(currentSIPDate).format("DD-MM-YYYY")
        );
        console.log(
          "check",
          ptr.value.date === moment(currentSIPDate).format("DD-MM-YYYY")
        );
        console.log(
          "moment(ptr.value.date",
          moment(ptr.value.date, "DD-MM-YYYY").get("date")
        );
        console.log("fromSIPDate", fromSIPDate);
        console.log("toSIPDate", toSIPDate);
        console.log(
          'moment(toSIPDate,"DD-MM-YYYY").diff(moment(ptr.value.date,"DD-MM-YYYY"))',
          moment(toSIPDate, "DD-MM-YYYY").diff(
            moment(ptr.value.date, "DD-MM-YYYY")
          )
        );
        if (
          moment(toSIPDate, "YYYY-MM-DD").diff(
            moment(ptr.value.date, "DD-MM-YYYY")
          ) > 0 &&
          (ptr.value.date === moment(currentSIPDate).format("DD-MM-YYYY") ||
            moment(ptr.value.date, "DD-MM-YYYY").diff(moment(currentSIPDate)) >
              0)
        ) {
          filterHistoricalNavs = filterHistoricalNavs.concat(ptr.value);
          currentSIPDate = moment(currentSIPDate, "DD-MM-YYYY").add(
            1,
            "months"
          );
          console.log("filterHistoricalNavs", filterHistoricalNavs);
        }
        console.log(
          'moment(ptr.value.date,"DD-MM-YYYY").diff(moment(currentSIPDate))',
          moment(ptr.value.date, "DD-MM-YYYY").diff(moment(currentSIPDate))
        );
        ptr = ptr.nextPtr;
      }
      setFilterHistoricalNav(filterHistoricalNavs);
      console.log("filter", filterHistoricalNavs);
    }
  }, [historicalNav, fromSIPDate, toSIPDate]);
  console.log("sellDate", sellDate);
  const SELL_DATE = moment(sellDate, "YYYY-MM-DD");
  const mfUnits = filterHistoricalNav.reduce(
    (acc, item) => {
      let currentDate = moment(item.date, "DD-MM-YYYY");

      // console.log("moment(item.date).isAfter(TODAY_DATE.subtract(1, 'years'))",moment(item.date).isAfter(TODAY_DATE.subtract(1, 'years')))
      console.log("today", currentDate.format("DD-MM-YYYY"));
      console.log("SELL_DATE", SELL_DATE.format("DD-MM-YYYY"));
      console.log("LAST_YEAR_DATE", LAST_YEAR_DATE.format("DD-MM-YYYY"));
      // let currentDate = moment(item.date).format("DD-MM-YYYY")
      console.log(
        "moment diff",
        currentDate.diff(SELL_DATE),
        currentDate.diff(moment(LAST_YEAR_DATE, "DD-MM-YYYY"))
      );

      if (currentDate.diff(SELL_DATE) <= 0) {
        if (currentDate.diff(moment(LAST_YEAR_DATE, "DD-MM-YYYY")) > 0) {
          acc = {
            ...acc,
            stcgUnits: acc.stcgUnits + Number(sipAmount / item.nav),
            stcgInvestmentAmount: Number(sipAmount) + acc.stcgInvestmentAmount,
          };
        } else {
          acc = {
            ...acc,
            ltcgUnits: acc.ltcgUnits + Number(sipAmount / item.nav),
            ltcgInvestmentAmount: Number(sipAmount) + acc.ltcgInvestmentAmount,
          };
        }
      }
      return {
        ...acc,
        totalUnits: acc.totalUnits + Number(sipAmount / item.nav),
      };
    },
    {
      ltcgUnits: 0,
      stcgUnits: 0,
      ltcgInvestmentAmount: 0,
      stcgInvestmentAmount: 0,
      totalUnits: 0,
    }
  );
  // const totalUnits = Number(mfUnits.ltcgUnits) + Number(mfUnits.stcgUnits)
  const totalInvestment = filterHistoricalNav.length * sipAmount;
  let totalProfit = 0;
  let totalLTCG = 0;
  let totalSTCG = 0;
  if (filterHistoricalNav.length > 0) {
    let buyNAV;
    let ptr = historicalNavLinkedList.head;
    while (ptr.nextPtr !== null && sellDate) {
      if (
        ptr.value.date === moment(SELL_DATE).format("DD-MM-YYYY") ||
        moment(ptr.value.date, "DD-MM-YYYY").diff(moment(SELL_DATE)) > 0
      ) {
        buyNAV = ptr.value.nav;
        console.log("buyNAV", buyNAV, ptr.value);
        break;
      }

      ptr = ptr.nextPtr;
    }
    const sellDateNav = sellDate ? buyNAV : historicalNav[0].nav;
    console.log("sellDateNav", sellDateNav);
    totalProfit = sellDate
      ? mfUnits.totalUnits * sellDateNav - totalInvestment
      : 0;
    totalLTCG = mfUnits.ltcgUnits * sellDateNav - mfUnits.ltcgInvestmentAmount;
    totalSTCG = mfUnits.stcgUnits * sellDateNav - mfUnits.stcgInvestmentAmount;
  }
  return (
    <div className="App">
      <main>
        {/* <div>
           <label>
              Search MF
           </label>
           <input type="text" value={inputValue} onChange={e=> setInputValue(e.target.value)}/>
           <select value={selectedMFSchemeCode} onChange={handleSelectListItem} >
            {mfList.map((listItem,index)=><option key={listItem.schemeCode+index+listItem.schemeName} value={listItem.schemeCode}>
                {listItem.schemeName}
              </option>)}
           </select>
           <label>
              SIP Amount
           </label>
           <input type="number" value={sipAmount} onChange={e=> setSipAmount(e.target.value)}/>
            <label>
              From SIP Date
           </label>
           <input type="date" value={fromSIPDate} onChange={e=> setFromSIPDate(e.target.value)}/>
           <label>
              To SIP Date
           </label>
           <input type="date" value={toSIPDate} onChange={e=> setToSIPDate(e.target.value)}/>
           <label>
              Sell Date
           </label>
           <input type="date" value={sellDate} onChange={e=> setSellDate(e.target.value)}/>
        </div> */}
        <SearchHeader
          inputValue={inputValue}
          setInputValue={setInputValue}
          selectedMFSchemeCode={selectedMFSchemeCode}
          setSelectedMFSchemeCode={setSelectedMFSchemeCode}
          mfList={mfList}
          sipAmount={sipAmount}
          setSipAmount={setSipAmount}
          fromSIPDate={fromSIPDate}
          setFromSIPDate={setFromSIPDate}
          toSIPDate={toSIPDate}
          setToSIPDate={setToSIPDate}
          sellDate={sellDate}
          setSellDate={setSellDate}
        />
        <div>
          <div>
            Total Investments: <span>{totalInvestment}</span>
          </div>
          <div>
            Total units: <span>{mfUnits.totalUnits}</span>
          </div>
          <div>
            Total LTCG units: <span>{mfUnits.ltcgUnits}</span>
          </div>
          <div>
            Total STCG units: <span>{mfUnits.stcgUnits}</span>
          </div>
          <div>
            Total profit: <span>{totalProfit}</span>
          </div>
          <div>
            Total LTCG: <span>{totalLTCG}</span>
          </div>
          <div>
            Total STCG: <span>{totalSTCG}</span>
          </div>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <th width="25%">S.No</th>
                <th width="25%">NAV date</th>
                <th width="25%">Net Asset Value</th>
                <th width="25%">Units Purchased</th>
              </tr>
              {filterHistoricalNav.map((listItem, index) => {
                return (
                  <tr key={listItem.date}>
                    <td>{index + 1}</td>
                    <td>{listItem.date}</td>
                    <td>{listItem.nav}</td>
                    <td>{Number(sipAmount / listItem.nav)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default MutualFundsTracker;
