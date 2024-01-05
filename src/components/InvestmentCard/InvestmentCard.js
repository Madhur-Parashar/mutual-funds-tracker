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
  totalValue,
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
      <div className="calc-wrapper__result">
        <ul>
          <li>Invested Amount</li>
          <li id="TotalInvestment">
            ₹{(totalInvestment && totalInvestment.toFixed(2)) || 0}
          </li>
        </ul>
        <ul>
          <li>Current Value</li>
          <li id="total_units">₹{totalValue && totalValue.toFixed(2)}</li>
        </ul>

        {isSellUnits ? (
          <>
            <ul>
              <li>Wealth Gained</li>
              <li id="gained">₹{totalProfit && totalProfit.toFixed(2)}</li>
            </ul>
            <ul>
              <li>LT gain/loss</li>
              <li id="total_units">₹{totalLTCG && totalLTCG.toFixed(2)}</li>
            </ul>
            <ul>
              <li>ST gain/loss</li>
              <li id="total_units">₹{totalSTCG && totalSTCG.toFixed(2)}</li>
            </ul>
            <ul>
              <li>LT units</li>
              <li id="total_units">{ltcgUnits && ltcgUnits.toFixed(2)}</li>
            </ul>
            <ul>
              <li>ST units</li>
              <li id="total_units">{stcgUnits && stcgUnits.toFixed(2)}</li>
            </ul>
          </>
        ) : null}
        <ul>
          <li>Total units alloted</li>
          <li id="total_units">{(totalUnits && totalUnits.toFixed(2)) || 0}</li>
        </ul>
      </div>
    </Card>
  );
}
