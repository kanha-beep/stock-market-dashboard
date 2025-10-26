import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Search, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../init/api";

const Portfolio = ({
  refreshTrigger,
  showDelete = true,
  showEdit = true,
  enableFilters = true,
  enablePagination = true,
}) => {
  const [stocks, setStocks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredStocks, setFilteredStocks] = useState([]);
  // For edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedStock, setSelectedStock] = useState({});
  const getStock = async () => {
    try {
      const res = await api.get(
        `/stocks/buy-list?sortKey=${sortKey}&sortOrder=${sortOrder}&search=${search}`
      );
      setStocks(res.data.trades);
      setFilteredStocks(res.data.trades);
      console.log("pagination: ", res.data);
    } catch (err) {
      console.error(err?.response?.data);
    }
  };

  useEffect(() => {
    getStock();
  }, [sortKey, sortOrder, refreshTrigger, search]);

  const displayedStocks = enablePagination
    ? filteredStocks?.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    : filteredStocks;

  const handleEdit = (stock) => {
    setSelectedStock({ ...stock });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    try {
      const res = await api.patch(
        `/stocks/${selectedStock._id}/edit`,
        selectedStock
      );
      console.log("stock updated: ", res.data);
      setOpenEdit(false);
      getStock();
    } catch (err) {
      console.error(err?.response?.data);
    }
  };

  const handleDelete = async (stockId) => {
    try {
      await api.delete(`/stocks/${stockId}/delete`);
      getStock();
    } catch (err) {
      console.error(err);
    }
  };
  console.log("stocks", stocks);
  return (
    <Card
      sx={{
        maxHeight: "600px",
        overflowY: enablePagination ? "auto" : "visible",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          My Portfolio
        </Typography>

        {enableFilters && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              label="Search Stock"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Select
              size="small"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="" disabled>
                Select Sort
              </MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="qty">Quantity</MenuItem>
              <MenuItem value="price">Buy Price</MenuItem>
            </Select>

            <IconButton
              size="small"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              color="primary"
            >
              {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
            </IconButton>
          </Box>
        )}

        {stocks ? (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Stock</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Buy Price</TableCell>
                {/* <TableCell>Current</TableCell> */}
                {/* <TableCell>Profit/Loss</TableCell> */}
                {showEdit && <TableCell>Edit</TableCell>}
                {showDelete && <TableCell>Delete</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedStocks.map((p) => {
                // const profit = 0;
                return (
                  <TableRow key={p._id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.qty}</TableCell>
                    <TableCell>Rs {p.price}</TableCell>
                    {/* <TableCell>Rs {p.price}</TableCell> */}
                    {/* <TableCell sx={{ color: profit >= 0 ? "green" : "red" }}>
                    Rs {profit}
                  </TableCell> */}
                    {showEdit && (
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                    {showDelete && (
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(p._id)}
                        >
                          Sell
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          "Loading..."
        )}

        {enablePagination && (
          <TablePagination
            component="div"
            count={filteredStocks?.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}

        {/* Edit Modal */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Edit Stock</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Quantity"
              type="number"
              value={selectedStock?.qty || ""}
              onChange={(e) =>
                setSelectedStock({ ...selectedStock, qty: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Buy Price"
              type="number"
              value={selectedStock?.price || ""}
              onChange={(e) =>
                setSelectedStock({ ...selectedStock, price: e.target.value })
              }
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={saveEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default Portfolio;
