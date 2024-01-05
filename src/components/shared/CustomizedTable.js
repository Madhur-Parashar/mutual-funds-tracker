import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function CustomizedTables({
  tableRowData,
  tableHeadRows,
  isCustomized
}) {
  const TableRowComponent = isCustomized ? StyledTableRow : TableRow;
  const TableCellComponent = isCustomized ? StyledTableCell : TableCell;
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRowComponent>
            {tableHeadRows.map((row, index) => (
              <TableCellComponent
                align={index === 0 ? "left" : "right"}
                key={index}
                sx={{
                  'fontWeight': '600'
                }}
              >
                {row}
              </TableCellComponent>
            ))}
          </TableRowComponent>
        </TableHead>
        <TableBody>
          {tableRowData.map((row, index) => (
            <TableRowComponent key={index}>
              <TableCellComponent component="th" scope="row">
                {row.heading}
              </TableCellComponent>
              {row.rowData.map((row) => (
                <TableCellComponent key={row} align="right">{row}</TableCellComponent>
              ))}
            </TableRowComponent>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
