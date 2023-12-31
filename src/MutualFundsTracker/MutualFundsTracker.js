import moment from "moment";

import { useState, useCallback } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import LinkedList from "../utils/linked-list";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import CustomizedTables from "../components/shared/CustomizedTable";
import InvestmentCard from "../components/InvestmentCard/InvestmentCard";

const LAST_YEAR_DATE = moment().subtract(3, "years");
const LAST_FY_YEAR_MONTHS = [0, 1, 2]; // January, Feburary, March
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 942,
  height: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
};
function MutualFundsTracker() {
  const [selectedHistoricalNav, setSelectedHistoricalNav] = useState([]);
  const [showNavHistoryModal, setShowNavHistoryModal] = useState(false);
  const [isSellUnits, setIsSellUnits] = useState(false);
  const [mfInvestmentsData, setMfInvestmentsData] = useState([]);
  const calculateFilteredHistoricalNavs = (
    schemeName,
    fromSIPDate,
    toSIPDate,
    historicalNavlinkedList,
    amount
  ) => {
    console.log("linkedList", historicalNavlinkedList);
    let filterHistoricalNavs = [];
    let currentSIPDate = moment(fromSIPDate, "YYYY-MM-DD");
    let ptr = historicalNavlinkedList.head;
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
          heading: schemeName,
          rowData: [
            ptr.value.date,
            (ptr.value.nav && Number(ptr.value.nav).toFixed(3)) || 0,
            (ptr.value.nav && Number(amount / ptr.value.nav).toFixed(3)) || 0,
          ],
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

  const calculateMFUnits = (filterHistoricalNavs, amount, sellDate) => {
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
    historicalNavlinkedList,
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
    let currentValue = 0;
    if (filterHistoricalNavs.length > 0) {
      let buyNAV;
      let ptr = historicalNavlinkedList.head;
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
      currentValue = sellDate
        ? mfUnits.totalUnits *
          Number(filterHistoricalNavs[filterHistoricalNavs.length - 1].nav)
        : 0;
      totalProfit = sellDate
        ? mfUnits.totalUnits * sellDateNav - totalInvestment
        : 0;
      totalLTCG =
        mfUnits.ltcgUnits * sellDateNav - mfUnits.ltcgInvestmentAmount;
      totalSTCG =
        mfUnits.stcgUnits * sellDateNav - mfUnits.stcgInvestmentAmount;

      console.log({ totalProfit, totalLTCG, totalSTCG, totalInvestment });
    }
    return { totalProfit, totalLTCG, totalSTCG, totalInvestment, currentValue };
  };

  const handleOnSearch = useCallback(
    async ({
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
        linkedList,
        amount
      );
      setSelectedHistoricalNav(filterHistoricalNavs);
      let mfUnits = calculateMFUnits(filterHistoricalNavs, amount, sellDate);
      console.log("MFUNITS", mfUnits);
      let { totalProfit, totalLTCG, totalSTCG, totalInvestment, currentValue } =
        calculateTotalInvestment(
          filterHistoricalNavs,
          linkedList,
          historicalNav,
          sellDate,
          amount,
          mfUnits
        );
      console.log(
        "moment(sellDate).month()",
        moment(sellDate).month(),
        moment(sellDate).year()
      );
      let financialYear = `${moment(sellDate).year()}-${moment(sellDate)
        .add(1, "years")
        .year()}`;
      if (LAST_FY_YEAR_MONTHS.includes(moment(sellDate).month())) {
        financialYear = `${moment(sellDate)
          .subtract(1, "years")
          .year()}-${moment(sellDate).year()}`;
      }
      console.log("financialYear", financialYear);
      setMfInvestmentsData((mfData) => [
        ...mfData,
        {
          totalProfit,
          totalLTCG,
          totalSTCG,
          totalInvestment,
          mfUnits,
          amount,
          selectedMFSchemeName: selectedMFScheme.schemeName,
          schemeCode: selectedMFScheme.schemeCode,
          financialYear: financialYear,
          currentValue,
          index:mfData.length+1,
          fromSIPDate: moment(fromSIPDate).format("DD-MM-YYYY"),
          toSIPDate: moment(toSIPDate).format("DD-MM-YYYY"),
          sellDate: moment(sellDate).format("DD-MM-YYYY"),
          hisorticalNav: filterHistoricalNavs,
        },
      ]);
    },
    []
  );
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

  const tableMFListData =
    mfInvestmentsData.length > 0
      ? mfInvestmentsData.reduce((acc, item) => {
          acc = acc.concat({
            heading: item.selectedMFSchemeName,
            rowData: [
              // `₹${item.amount}`,
              `₹${item.totalInvestment}`,
              `₹${item.currentValue.toFixed(2)}`,
              Number(item.mfUnits.totalUnits).toFixed(3),
              item.fromSIPDate,
              item.toSIPDate,
              item.sellDate,
              item.totalLTCG.toFixed(2),
              item.totalSTCG.toFixed(2),
              item.financialYear,
            ],
            ...item
          });
          return acc;
        }, [])
      : [];
  const InvestmentCardData = mfInvestmentsData.reduce(
    (acc, item) => {
      acc.totalInvestment = acc.totalInvestment + Number(item.totalInvestment);
      acc.currentValue = acc.currentValue + Number(item.currentValue);
      acc.totalUnits =
        acc.totalUnits + Number((item.mfUnits && item.mfUnits.totalUnits) || 0);
      acc.ltcgUnits =
        acc.ltcgUnits + Number((item.mfUnits && item.mfUnits.ltcgUnits) || 0);
      acc.stcgUnits =
        acc.stcgUnits + Number((item.mfUnits && item.mfUnits.stcgUnits) || 0);
      acc.totalProfit = acc.totalProfit + Number(item.totalProfit);
      acc.totalLTCG = acc.totalLTCG + Number(item.totalLTCG);
      acc.totalSTCG = acc.totalSTCG + Number(item.totalSTCG);
      return acc;
    },
    {
      totalInvestment: 0,
      currentValue: 0,
      totalUnits: 0,
      ltcgUnits: 0,
      stcgUnits: 0,
      totalProfit: 0,
      totalLTCG: 0,
      totalSTCG: 0,
    }
  );
  console.log("tableMFListData", tableMFListData);
  console.log("InvestmentCardData", InvestmentCardData);
  const openNavHistoryModal = ({ schemeCode,index }) => {
    console.log("schemeCode",schemeCode);
    let mf = mfInvestmentsData.find(item=> item.schemeCode === schemeCode && index ===item.index);
    if(mf){
      console.log("mf.hisorticalNav",mf.hisorticalNav)
      setSelectedHistoricalNav(mf.hisorticalNav)
    }
    setShowNavHistoryModal(true);
  };
  const handleModalClose = () => {
    setShowNavHistoryModal(false);
  };

  return (
    <div className="App">
      <main className="mutual-fund-tracker-main">
        <SearchHeader onSearchHandler={handleOnSearch} />
        <InvestmentCard
          totalInvestment={InvestmentCardData.totalInvestment}
          totalValue={InvestmentCardData.currentValue}
          totalProfit={InvestmentCardData.totalProfit}
          totalLTCG={InvestmentCardData.totalLTCG}
          totalSTCG={InvestmentCardData.totalSTCG}
          isSellUnits={isSellUnits}
        />
        <div>
          {tableMFListData.length > 0 ? (
            <CustomizedTables
              tableRowData={tableMFListData}
              isHeadingLink={true}
              onClickHeadingLink={openNavHistoryModal}
              tableHeadRows={[
                "Mutual fund name",
                // "SIP Amount",
                "Invested",
                "Value",
                "Units",
                "From Date",
                "To Date",
                "Sell Date",
                "LTCG",
                "STCG",
                "FY"
              ]}
            />
          ) : null}
        </div>
        <div>
          <Modal
            open={showNavHistoryModal && selectedHistoricalNav.length > 0}
            onClose={handleModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              <CustomizedTables
                isCustomized={true}
                tableRowData={selectedHistoricalNav}
                tableHeadRows={[
                  "Mutual fund name",
                  "NAV date",
                  "Net Asset Value",
                  "Units Purchased",
                ]}
              />
            </Box>
          </Modal>
        </div>
      </main>
    </div>
  );
}

export default MutualFundsTracker;
