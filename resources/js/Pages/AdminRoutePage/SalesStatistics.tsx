import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import apiService from '../Services/ApiService';

interface BranchSalesData {
  branch: string;
  monthlySales: number[];
  yearlySales: number;
  taxRate: number; // e.g., 0.12 = 12%
  monthlyExpenses: number[]; // Monthly expenses for each branch
  yearlyExpenses: number; // Yearly expenses for each branch
}

interface MonthlySalesDetail {
  month: string;
  sales: number;
}

const SalesStatistics: React.FC = () => {
  const [salesData, setSalesData] = useState<BranchSalesData[]>([]);
  const [totalInvestment, setTotalInvestment] = useState<number>(0); // State for Total Investment
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openModal, setOpenModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [monthlySalesDetails, setMonthlySalesDetails] = useState<MonthlySalesDetail[]>([]);
  const [remittanceTotalExpenses, setRemittanceTotalExpenses] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiService
      .get(`/sales-statistics?year=${selectedYear}`)
      .then((response) => {
        setSalesData(response.data.branchSalesData);
        setTotalInvestment(response.data.totalInvestment); // Set total investment
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sales statistics:', error);
        setIsLoading(false);
      });
  }, [selectedYear]);

  const totalMonthlySales = Array(12).fill(0).map((_, index) =>
    salesData.reduce((sum, branch) => sum + branch.monthlySales[index], 0)
  );

  const totalMonthlyExpenses = Array(12).fill(0).map((_, index) =>
    salesData.reduce((sum, branch) => sum + branch.monthlyExpenses[index], 0)
  );

  const totalYearlySales = salesData.reduce((sum, branch) => sum + branch.yearlySales, 0);
  const totalYearlyExpenses = salesData.reduce((sum, branch) => sum + branch.yearlyExpenses, 0);
  const totalNetSales = totalYearlySales - totalYearlyExpenses;

  // Calculate Total Profit
  const totalProfit =
  totalYearlySales -
  parseFloat(totalInvestment.toString().replace(/[^0-9.-]+/g, '')) -
  totalYearlyExpenses;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleBranchClick = async (branchName: string) => {
    try {
      setOpenModal(true);
      const response = await apiService.get(`/branch-monthly-sales-statistics?branch=${branchName}&year=${selectedYear}`);
      const monthlyDetails = response.data.monthly_sales.map((item: any) => ({
        month: new Date(0, item.month - 1).toLocaleString('default', { month: 'long' }),
        sales: item.sales,
      }));

      setMonthlySalesDetails(monthlyDetails);
      setRemittanceTotalExpenses(response.data.total_remittance_expenses);
      setSelectedBranch(branchName);
    } catch (error) {
      console.error('Error fetching monthly sales details:', error);
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedBranch(null);
  };

  return (
    <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Statistics</h2>}>
      <Head title="Sales Statistics" />

      <Paper sx={{ p: 4, mt: 1 }}>
        {/* Year Picker */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ width: 150 }}
          >
            {yearOptions.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Branch</strong></TableCell>
                {[...Array(12)].map((_, i) => (
                  <TableCell key={i} align="right">
                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                  </TableCell>
                ))}
                <TableCell align="right"><strong>Yearly Sales</strong></TableCell>
                <TableCell align="right"><strong>Yearly Expenses</strong></TableCell>
                <TableCell align="right"><strong>Net Sales</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.map((branch) => (
                <TableRow
                  key={branch.branch}
                  hover
                  onClick={() => handleBranchClick(branch.branch)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } }}
                >
                  <TableCell>
                    <Tooltip title="Click to view monthly details">
                      <Typography sx={{ color: 'blue', textDecoration: 'underline' }}>
                        {branch.branch}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  {branch.monthlySales.map((sale, idx) => (
                    <TableCell key={idx} align="right">₱{sale.toLocaleString()}</TableCell>
                  ))}
                  <TableCell align="right">₱{branch.yearlySales.toLocaleString()}</TableCell>
                  <TableCell align="right">₱{branch.yearlyExpenses.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    ₱{(branch.yearlySales - branch.yearlyExpenses).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Total</strong></TableCell>
                {totalMonthlySales.map((total, idx) => (
                  <TableCell key={idx} align="right"><strong>₱{total.toLocaleString()}</strong></TableCell>
                ))}
                <TableCell align="right"><strong>₱{totalYearlySales.toLocaleString()}</strong></TableCell>
                <TableCell align="right"><strong>₱{totalYearlyExpenses.toLocaleString()}</strong></TableCell>
                <TableCell align="right"><strong>₱{totalNetSales.toLocaleString()}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between">
          <Tooltip title="Total investment for the selected year">
            <Typography variant="body1">
              <strong>Total Investment:</strong> ₱{totalInvestment.toLocaleString()}
            </Typography>
          </Tooltip>
          <Tooltip title="Total expenses incurred in the selected year">
            <Typography variant="body1">
              <strong>Total Yearly Expenses:</strong> ₱{totalYearlyExpenses.toLocaleString()}
            </Typography>
          </Tooltip>
          <Tooltip title="Total revenue generated in the selected year">
            <Typography variant="body1">
              <strong>Total Yearly Revenue:</strong> ₱{totalYearlySales.toLocaleString()}
            </Typography>
          </Tooltip>
          <Tooltip title="Total profit for the selected year">
          <Typography variant="body1">
              <strong>Total Profit:</strong> ₱
              {isNaN(totalProfit) ? '0' : totalProfit.toLocaleString()}
            </Typography>
          </Tooltip>
        </Box>
      </Paper>

      {/* Modal for Monthly Sales Details */}
      <Dialog open={openModal} onClose={closeModal}>
        <DialogTitle sx={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', py: 2, px: 3 }}>
        {selectedBranch ? `Monthly Sales for ${selectedBranch}` : ''}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {monthlySalesDetails.length === 0 && <CircularProgress />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Month</strong></TableCell>
                <TableCell align="right"><strong>Sales (₱)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlySalesDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.month}</TableCell>
                  <TableCell align="right">{detail.sales.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {remittanceTotalExpenses !== null && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Total Expenses:</strong> ₱{remittanceTotalExpenses.toLocaleString()}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SalesStatistics;