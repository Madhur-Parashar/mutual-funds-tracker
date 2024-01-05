import moment from "moment";

import { useState, useCallback } from "react";
import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import LinkedList from "../utils/linked-list";
import SearchHeader from "../components/SearchHeader/SearchHeader";
import CustomizedTables from "../components/shared/CustomizedTable";
import InvestmentCard from "../components/InvestmentCard/InvestmentCard";

const LAST_YEAR_DATE = moment().subtract(1, "years");
const LAST_FY_YEAR_MONTHS = [0, 1, 2]; // January, Feburary, March
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 942,
  height: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
};
function MutualFundsTracker() {
  const [filterHistoricalNav, setFilterHistoricalNav] = useState([]);
  const [showNavHistoryModal, setShowNavHistoryModal] = useState(false);
  const [isSellUnits, setIsSellUnits] = useState(false);
  const [mfInvestmentsData, setMfInvestmentsData] = useState({
    sipAmount: 0,
    currentValue: 0,
    totalProfit: 0,
    totalLTCG: 0,
    totalSTCG: 0,
    totalInvestment: 0,
    mfUnits: null,
    selectedMFSchemeName: "",
    financialYear: "",
    fromSIPDate: null,
    toSIPDate: null,
    sellDate: null,
  });

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
      setFilterHistoricalNav(filterHistoricalNavs);
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
      setMfInvestmentsData({
        sipAmount: amount,
        totalProfit,
        totalLTCG,
        totalSTCG,
        totalInvestment,
        mfUnits,
        amount,
        selectedMFSchemeName: selectedMFScheme.schemeName,
        financialYear: financialYear,
        currentValue,
        fromSIPDate: moment(fromSIPDate).format("DD-MM-YYYY"),
        toSIPDate: moment(toSIPDate).format("DD-MM-YYYY"),
        sellDate: moment(sellDate).format("DD-MM-YYYY"),
      });
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

  const tableMFListData = mfInvestmentsData.mfUnits
    ? [
        {
          heading: mfInvestmentsData.selectedMFSchemeName,
          rowData: [
            `₹${mfInvestmentsData.sipAmount}`,
            `₹${mfInvestmentsData.totalInvestment}`,
            `₹${mfInvestmentsData.currentValue.toFixed(3)}`,
            Number(mfInvestmentsData.mfUnits.totalUnits).toFixed(3),
            mfInvestmentsData.fromSIPDate,
            mfInvestmentsData.toSIPDate,
            mfInvestmentsData.sellDate,
            mfInvestmentsData.financialYear,
          ],
        },
      ]
    : [];
  console.log("tableMFListData", tableMFListData);
  const openNavHistoryModal = ({schemeCode}) => {
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
          totalInvestment={mfInvestmentsData.totalInvestment}
          totalValue={mfInvestmentsData.currentValue}
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
          {tableMFListData.length > 0 ? (
            <CustomizedTables
              tableRowData={tableMFListData}
              isHeadingLink={true}
              onClickHeadingLink={openNavHistoryModal}
              tableHeadRows={[
                "Mutual fund name",
                "SIP Amount",
                "Invested",
                "Current Value",
                "Units Alloted",
                "From Date",
                "To Date",
                "Sell Date",
                "FY",
              ]}
            />
          ) : null}
        </div>
        <div>
          <Modal
            open={showNavHistoryModal && filterHistoricalNav.length > 0}
            onClose={handleModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
          <Box sx={modalStyle}>
            <CustomizedTables
              isCustomized={true}
              tableRowData={filterHistoricalNav}
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
