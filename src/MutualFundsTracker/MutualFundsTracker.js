import moment from "moment";

import { useState } from "react";
import LinkedList from "../utils/linked-list";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import CustomizedTables from "../components/shared/CustomizedTable";
import InvestmentCard from "../components/InvestmentCard/InvestmentCard";

const LAST_YEAR_DATE = moment().subtract(1, "years");
function MutualFundsTracker() {
  const [filterHistoricalNav, setFilterHistoricalNav] = useState([]);
  const [isSellUnits, setIsSellUnits] = useState(false);
  const [mfInvestmentsData, setMfInvestmentsData] = useState({
    totalProfit: 0,
    totalLTCG: 0,
    totalSTCG: 0,
    totalInvestment: 0,
    mfUnits: null,
    selectedMFSchemeName: "",
  });

  const calculateFilteredHistoricalNavs = (
    schemeName,
    fromSIPDate,
    toSIPDate,
    linkedList
  ) => {
    console.log("linkedList", linkedList);
    let filterHistoricalNavs = [];
    let currentSIPDate = moment(fromSIPDate, "YYYY-MM-DD");
    let ptr = linkedList.head;
    while (ptr.nextPtr !== null) {
      console.log("date", ptr.value.date);
      if (
        moment(toSIPDate, "YYYY-MM-DD").diff(
          moment(ptr.value.date, "DD-MM-YYYY")
        ) > 0 &&
        (ptr.value.date === moment(currentSIPDate).format("DD-MM-YYYY") ||
          moment(ptr.value.date, "DD-MM-YYYY").diff(moment(currentSIPDate)) > 0)
      ) {
        filterHistoricalNavs = filterHistoricalNavs.concat({
          schemeName,
          ...ptr.value,
        });
        currentSIPDate = moment(currentSIPDate, "DD-MM-YYYY").add(1, "months");
        console.log("filterHistoricalNavs", filterHistoricalNavs);
      }
      ptr = ptr.nextPtr;
    }
    console.log("filter", filterHistoricalNavs);
    return filterHistoricalNavs;
  };

  const calculateMFUnits = (filterHistoricalNavs, amount,sellDate) => {
    const SELL_DATE = moment(sellDate, "YYYY-MM-DD");
    const mfUnits = filterHistoricalNavs.reduce(
      (acc, item) => {
        let currentDate = moment(item.date, "DD-MM-YYYY");

        console.log("today", currentDate.format("DD-MM-YYYY"));
        console.log("SELL_DATE", SELL_DATE.format("DD-MM-YYYY"));
        console.log("LAST_YEAR_DATE", LAST_YEAR_DATE.format("DD-MM-YYYY"));
        console.log(
          "moment diff",
          currentDate.diff(SELL_DATE),
          currentDate.diff(moment(LAST_YEAR_DATE, "DD-MM-YYYY"))
        );

        if (currentDate.diff(SELL_DATE) <= 0) {
          if (currentDate.diff(moment(LAST_YEAR_DATE, "DD-MM-YYYY")) > 0) {
            acc = {
              ...acc,
              stcgUnits: acc.stcgUnits + Number(amount / item.nav),
              stcgInvestmentAmount: Number(amount) + acc.stcgInvestmentAmount,
            };
          } else {
            acc = {
              ...acc,
              ltcgUnits: acc.ltcgUnits + Number(amount / item.nav),
              ltcgInvestmentAmount: Number(amount) + acc.ltcgInvestmentAmount,
            };
          }
        }
        return {
          ...acc,
          totalUnits: acc.totalUnits + Number(amount / item.nav),
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
    return mfUnits;
  };

  const calculateTotalInvestment = (
    filterHistoricalNavs,
    linkedList,
    historicalNav,
    sellDate,
    amount,
    mfUnits
  ) => {
    const SELL_DATE = moment(sellDate, "YYYY-MM-DD");
    const totalInvestment = filterHistoricalNavs.length * amount;
    let totalProfit = 0;
    let totalLTCG = 0;
    let totalSTCG = 0;
    if (filterHistoricalNavs.length > 0) {
      let buyNAV;
      let ptr = linkedList.head;
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
      totalLTCG =
        mfUnits.ltcgUnits * sellDateNav - mfUnits.ltcgInvestmentAmount;
      totalSTCG =
        mfUnits.stcgUnits * sellDateNav - mfUnits.stcgInvestmentAmount;

      console.log({ totalProfit, totalLTCG, totalSTCG, totalInvestment });
      return { totalProfit, totalLTCG, totalSTCG, totalInvestment };
    }
  };

  const handleOnSearch = async ({
    amount,
    mfList,
    selectedMFScheme,
    fromSIPDate,
    toSIPDate,
    sellDate,
  }) => {
    console.log({
      amount,
      mfList,
      selectedMFScheme,
      fromSIPDate,
      toSIPDate,
      sellDate,
    });
    setIsSellUnits(Boolean(moment(sellDate).isValid()));
    let historicalNav = await fetchHistoricalNav(selectedMFScheme.schemeCode);
    console.log("historicalNav", historicalNav);
    let linkedList = new LinkedList();
    historicalNav.forEach((item) => linkedList.insertAtFront(item));
    let filterHistoricalNavs = calculateFilteredHistoricalNavs(
      selectedMFScheme.schemeName,
      fromSIPDate,
      toSIPDate,
      linkedList
    );
    setFilterHistoricalNav(filterHistoricalNavs);
    let mfUnits = calculateMFUnits(filterHistoricalNavs, amount,sellDate);
    console.log("MFUNITS", mfUnits);
    let { totalProfit, totalLTCG, totalSTCG, totalInvestment } =
      calculateTotalInvestment(
        filterHistoricalNavs,
        linkedList,
        historicalNav,
        sellDate,
        amount,
        mfUnits
      );
    setMfInvestmentsData({
      totalProfit,
      totalLTCG,
      totalSTCG,
      totalInvestment,
      mfUnits,
      amount,
      selectedMFSchemeName: selectedMFScheme.schemeName,
    });
  };
  async function fetchHistoricalNav(selectedMFSchemeCode) {
    let response = await fetch(
      `https://api.mfapi.in/mf/${selectedMFSchemeCode}`
    );
    let historicalNav = await response.json();
    if (historicalNav.status === "SUCCESS") {
      return historicalNav.data;
    }
    return [];
  }

  return (
    <div className="App">
      <main className="mutual-fund-tracker-main">
        <SearchHeader onSearchHandler={handleOnSearch} />
        <InvestmentCard
          totalInvestment={mfInvestmentsData.totalInvestment}
          totalUnits={
            mfInvestmentsData.mfUnits && mfInvestmentsData.mfUnits.totalUnits
          }
          ltcgUnits={
            mfInvestmentsData.mfUnits && mfInvestmentsData.mfUnits.ltcgUnits
          }
          stcgUnits={
            mfInvestmentsData.mfUnits && mfInvestmentsData.mfUnits.stcgUnits
          }
          totalProfit={mfInvestmentsData.totalProfit}
          totalLTCG={mfInvestmentsData.totalLTCG}
          totalSTCG={mfInvestmentsData.totalSTCG}
          isSellUnits={isSellUnits}
        />
        <div>
          {filterHistoricalNav.length > 0 ? (
            <CustomizedTables
              filterHistoricalNav={filterHistoricalNav}
              sipAmount={mfInvestmentsData.amount}
              tableHeadRows={[
                "Mutual fund name",
                "NAV date",
                "Net Asset Value",
                "Units Purchased",
              ]}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default MutualFundsTracker;
