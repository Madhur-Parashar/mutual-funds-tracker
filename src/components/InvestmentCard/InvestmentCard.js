import React from "react";
import Card from "@mui/material/Card";

export default function InvestmentCard({
  totalInvestment,
  totalUnits,
  ltcgUnits,
  stcgUnits,
  totalProfit,
  totalLTCG,
  totalSTCG,
  isSellUnits,
}) {
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
      <div class="calc-wrapper__result">
        <ul>
          <li>
            <span class="invested"></span>
            Invested Amount
          </li>
          <li id="TotalInvestment">₹{totalInvestment}</li>
        </ul>
        <ul>
          <li>Total units alloted</li>
          <li id="total_units">{totalUnits}</li>
        </ul>

        {isSellUnits ? (
          <>
            <ul>
              <li>
                <span class="wealth"></span>
                Wealth Gained
              </li>
              <li id="gained">₹{totalProfit}</li>
            </ul>
            <ul>
              <li>Total long term capital gain</li>
              <li id="total_units">₹{totalLTCG}</li>
            </ul>
            <ul>
              <li>Total short term capital gain</li>
              <li id="total_units">₹{totalSTCG}</li>
            </ul>
          </>
        ) : null}
      </div>
    </Card>
  );
}
