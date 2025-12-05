import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
    RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import apiService from '../Services/ApiService';
import { 
    TrendingUp, Building2, Calendar, DollarSign, Trophy, 
    ArrowUpRight, ArrowDownRight, Target, PieChart as PieChartIcon,
    BarChart3, Activity, Download, Filter, RefreshCw, Zap,
    Award, TrendingDown, Percent, Users, ShoppingCart,
    ChevronUp, ChevronDown, Flame, Sparkles, Crown
} from 'lucide-react';
import SharedStyles from './SharedStyles';

interface Branch {
    id: number;
    name: string;
}

interface BranchSalesData {
    branch: string;
    total: number;
    orderCount: number;
    avgOrder: number;
    color: string;
    monthlyData: number[];
    growth: number;
}

interface MonthlyData {
    month: string;
    monthIndex: number;
    [key: string]: string | number;
}

interface DailySales {
    date: string;
    total_sales: number;
}

interface HeatmapData {
    branch: string;
    [key: string]: string | number;
}

const COLORS = ['#0F766E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1'];
const GRADIENT_COLORS = [
    ['#0F766E', '#14B8A6'],
    ['#3B82F6', '#60A5FA'],
    ['#8B5CF6', '#A78BFA'],
    ['#F59E0B', '#FBBF24'],
    ['#EF4444', '#F87171'],
    ['#10B981', '#34D399'],
    ['#EC4899', '#F472B6'],
    ['#6366F1', '#818CF8']
];

const SalesStatistics: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchSalesData, setBranchSalesData] = useState<BranchSalesData[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyData[]>([]);
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [topBranch, setTopBranch] = useState<BranchSalesData | null>(null);
    const [bestMonth, setBestMonth] = useState<{ month: string; total: number } | null>(null);
    const [worstMonth, setWorstMonth] = useState<{ month: string; total: number } | null>(null);
    const [quarterlyData, setQuarterlyData] = useState<{ quarter: string; total: number }[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'charts' | 'heatmap'>('charts');

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await apiService.get('/get-branches');
                setBranches(response.data);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        if (branches.length === 0) return;
        fetchAllBranchData();
    }, [branches, selectedYear]);

    const fetchAllBranchData = async () => {
        setLoading(true);
        setRefreshing(true);
        try {
            const branchTotals: BranchSalesData[] = [];
            const monthlyDataMap: { [key: string]: MonthlyData } = {};
            const heatmap: HeatmapData[] = [];
            const monthTotals: { [key: string]: number } = {};
            
            months.forEach((month, index) => {
                monthlyDataMap[month] = { month, monthIndex: index };
                monthTotals[month] = 0;
            });

            let grandTotal = 0;
            let grandOrders = 0;

            for (let i = 0; i < branches.length; i++) {
                const branch = branches[i];
                let branchTotal = 0;
                let branchOrders = 0;
                const branchMonthlyData: number[] = [];
                const branchHeatmap: HeatmapData = { branch: branch.name };

                for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                    try {
                        const response = await apiService.get('/sales-report/daily', {
                            params: { user_name: branch.name, month: monthIndex, year: selectedYear }
                        });
                        
                        const monthData: DailySales[] = response.data.data || [];
                        const monthTotal = monthData.reduce((sum, d) => sum + (d.total_sales || 0), 0);
                        const monthOrders = monthData.filter(d => d.total_sales > 0).length;
                        
                        branchTotal += monthTotal;
                        branchOrders += monthOrders;
                        branchMonthlyData.push(monthTotal);
                        
                        monthlyDataMap[months[monthIndex]][branch.name] = monthTotal;
                        monthTotals[months[monthIndex]] += monthTotal;
                        branchHeatmap[months[monthIndex]] = monthTotal;
                    } catch (error) {
                        monthlyDataMap[months[monthIndex]][branch.name] = 0;
                        branchMonthlyData.push(0);
                        branchHeatmap[months[monthIndex]] = 0;
                    }
                }

                heatmap.push(branchHeatmap);

                // Calculate growth (comparing first half vs second half)
                const firstHalf = branchMonthlyData.slice(0, 6).reduce((a, b) => a + b, 0);
                const secondHalf = branchMonthlyData.slice(6).reduce((a, b) => a + b, 0);
                const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

                branchTotals.push({
                    branch: branch.name,
                    total: branchTotal,
                    orderCount: branchOrders,
                    avgOrder: branchOrders > 0 ? branchTotal / branchOrders : 0,
                    color: COLORS[i % COLORS.length],
                    monthlyData: branchMonthlyData,
                    growth
                });

                grandTotal += branchTotal;
                grandOrders += branchOrders;
            }

            branchTotals.sort((a, b) => b.total - a.total);
            
            // Find best and worst months
            const monthEntries = Object.entries(monthTotals);
            const sortedMonths = monthEntries.sort((a, b) => b[1] - a[1]);
            setBestMonth(sortedMonths[0] ? { month: sortedMonths[0][0], total: sortedMonths[0][1] } : null);
            const nonZeroMonths = sortedMonths.filter(m => m[1] > 0);
            setWorstMonth(nonZeroMonths.length > 0 ? { month: nonZeroMonths[nonZeroMonths.length - 1][0], total: nonZeroMonths[nonZeroMonths.length - 1][1] } : null);

            // Calculate quarterly data
            const quarters = [
                { quarter: 'Q1', total: monthTotals['Jan'] + monthTotals['Feb'] + monthTotals['Mar'] },
                { quarter: 'Q2', total: monthTotals['Apr'] + monthTotals['May'] + monthTotals['Jun'] },
                { quarter: 'Q3', total: monthTotals['Jul'] + monthTotals['Aug'] + monthTotals['Sep'] },
                { quarter: 'Q4', total: monthTotals['Oct'] + monthTotals['Nov'] + monthTotals['Dec'] },
            ];
            setQuarterlyData(quarters);
            
            setBranchSalesData(branchTotals);
            setMonthlyTrends(Object.values(monthlyDataMap));
            setHeatmapData(heatmap);
            setTotalRevenue(grandTotal);
            setTotalOrders(grandOrders);
            setTopBranch(branchTotals[0] || null);

        } catch (error) {
            console.error('Error fetching branch data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount: number): string => {
        if (amount >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `₱${(amount / 1000).toFixed(0)}K`;
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount);
    };

    const formatFullCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount);
    };

    // Calculate average monthly growth
    const avgGrowth = useMemo(() => {
        if (branchSalesData.length === 0) return 0;
        return branchSalesData.reduce((sum, b) => sum + b.growth, 0) / branchSalesData.length;
    }, [branchSalesData]);

    // Get max value for heatmap
    const maxHeatmapValue = useMemo(() => {
        let max = 0;
        heatmapData.forEach(row => {
            months.forEach(m => {
                if (typeof row[m] === 'number' && row[m] > max) max = row[m] as number;
            });
        });
        return max;
    }, [heatmapData]);

    const getHeatmapColor = (value: number): string => {
        if (value === 0) return '#F3F4F6';
        const intensity = value / maxHeatmapValue;
        if (intensity > 0.8) return '#0F766E';
        if (intensity > 0.6) return '#14B8A6';
        if (intensity > 0.4) return '#5EEAD4';
        if (intensity > 0.2) return '#99F6E4';
        return '#CCFBF1';
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="tooltip-item">
                            <span className="tooltip-dot" style={{ background: entry.color }}></span>
                            <span className="tooltip-name">{entry.name}:</span>
                            <span className="tooltip-value">{formatFullCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const RadialTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{payload[0].payload.quarter}</p>
                    <p className="tooltip-value" style={{ color: '#0F766E' }}>{formatFullCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sales Statistics</h2>}>
            <Head title="Sales Statistics" />
            <SharedStyles />

            <style>{`
                .sales-dashboard {
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F0FDFA 100%);
                    min-height: 100vh;
                }
                
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                
                .dashboard-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .title-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 14px rgba(15, 118, 110, 0.3);
                }
                
                .title-text h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0F172A;
                    margin: 0;
                }
                
                .title-text p {
                    font-size: 0.875rem;
                    color: #64748B;
                    margin: 0.25rem 0 0;
                }
                
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .view-toggle {
                    display: flex;
                    background: white;
                    border-radius: 10px;
                    padding: 4px;
                    border: 1px solid #E2E8F0;
                }
                
                .view-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: transparent;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: #64748B;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }
                
                .view-btn.active {
                    background: #0F766E;
                    color: white;
                    box-shadow: 0 2px 8px rgba(15, 118, 110, 0.3);
                }
                
                .year-selector {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                
                .year-selector select {
                    border: none;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #1E293B;
                    background: transparent;
                    cursor: pointer;
                }
                
                .refresh-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: 1px solid #E2E8F0;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748B;
                    transition: all 0.2s;
                }
                
                .refresh-btn:hover {
                    background: #F8FAFC;
                    color: #0F766E;
                    border-color: #0F766E;
                }
                
                .refresh-btn.spinning svg {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* KPI Cards */
                .kpi-section {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .kpi-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.25rem;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    transition: all 0.3s;
                    position: relative;
                    overflow: hidden;
                }
                
                .kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--kpi-color, #0F766E), var(--kpi-color-light, #14B8A6));
                }
                
                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }
                
                .kpi-card.primary {
                    background: linear-gradient(135deg, #0F766E 0%, #0D9488 100%);
                    border: none;
                    --kpi-color: #14B8A6;
                    --kpi-color-light: #2DD4BF;
                }
                
                .kpi-card.primary::before {
                    background: rgba(255,255,255,0.3);
                }
                
                .kpi-card.primary .kpi-label,
                .kpi-card.primary .kpi-value,
                .kpi-card.primary .kpi-meta {
                    color: white;
                }
                
                .kpi-card.primary .kpi-icon {
                    background: rgba(255,255,255,0.2);
                    color: white;
                }
                
                .kpi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                
                .kpi-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F0FDFA;
                    color: #0F766E;
                }
                
                .kpi-icon.blue { background: #EFF6FF; color: #3B82F6; }
                .kpi-icon.amber { background: #FFFBEB; color: #F59E0B; }
                .kpi-icon.purple { background: #F5F3FF; color: #8B5CF6; }
                .kpi-icon.rose { background: #FFF1F2; color: #F43F5E; }
                .kpi-icon.emerald { background: #ECFDF5; color: #10B981; }
                
                .kpi-badge {
                    font-size: 0.6875rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .kpi-badge.up { background: #ECFDF5; color: #059669; }
                .kpi-badge.down { background: #FEF2F2; color: #DC2626; }
                .kpi-badge.neutral { background: #F3F4F6; color: #6B7280; }
                
                .kpi-label {
                    font-size: 0.75rem;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                .kpi-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0F172A;
                    line-height: 1.2;
                }
                
                .kpi-meta {
                    font-size: 0.8125rem;
                    color: #64748B;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                /* Charts Section */
                .charts-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                
                .chart-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                
                .chart-card.full {
                    grid-column: 1 / -1;
                }
                
                .chart-card.third {
                    grid-column: span 1;
                }
                
                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #F1F5F9;
                }
                
                .chart-title {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #1E293B;
                }
                
                .chart-title svg {
                    color: #0F766E;
                }
                
                .chart-subtitle {
                    font-size: 0.75rem;
                    color: #94A3B8;
                    font-weight: 400;
                    margin-left: 0.5rem;
                }
                
                .chart-body {
                    padding: 1.25rem;
                }
                
                /* Custom Tooltip */
                .custom-tooltip {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.12);
                    min-width: 180px;
                }
                
                .tooltip-label {
                    font-weight: 600;
                    color: #1E293B;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #F1F5F9;
                }
                
                .tooltip-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.25rem 0;
                }
                
                .tooltip-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                
                .tooltip-name {
                    color: #64748B;
                    font-size: 0.8125rem;
                    flex: 1;
                }
                
                .tooltip-value {
                    font-weight: 600;
                    color: #1E293B;
                    font-size: 0.8125rem;
                }
                
                /* Branch Ranking */
                .ranking-list {
                    padding: 0;
                }
                
                .ranking-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #F1F5F9;
                    transition: all 0.2s;
                }
                
                .ranking-item:last-child {
                    border-bottom: none;
                }
                
                .ranking-item:hover {
                    background: linear-gradient(90deg, #F8FAFC 0%, transparent 100%);
                }
                
                .rank-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8125rem;
                    font-weight: 700;
                }
                
                .rank-badge.gold { 
                    background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); 
                    color: #B45309;
                    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
                }
                .rank-badge.silver { 
                    background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%); 
                    color: #475569;
                }
                .rank-badge.bronze { 
                    background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%); 
                    color: #C2410C;
                }
                .rank-badge.default { 
                    background: #F3F4F6; 
                    color: #6B7280; 
                }
                
                .rank-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .rank-name {
                    font-weight: 600;
                    color: #1E293B;
                    font-size: 0.9375rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .rank-stats {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 0.25rem;
                }
                
                .rank-stat {
                    font-size: 0.75rem;
                    color: #64748B;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .rank-progress {
                    width: 100%;
                    height: 6px;
                    background: #E5E7EB;
                    border-radius: 3px;
                    margin-top: 0.5rem;
                    overflow: hidden;
                }
                
                .rank-progress-bar {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }
                
                .rank-total {
                    font-weight: 700;
                    color: #0F766E;
                    font-size: 1rem;
                    white-space: nowrap;
                }
                
                /* Heatmap */
                .heatmap-container {
                    overflow-x: auto;
                    padding: 1rem;
                }
                
                .heatmap-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 4px;
                }
                
                .heatmap-table th {
                    font-size: 0.6875rem;
                    font-weight: 600;
                    color: #64748B;
                    padding: 0.5rem;
                    text-align: center;
                }
                
                .heatmap-table td {
                    padding: 0;
                }
                
                .heatmap-cell {
                    width: 100%;
                    height: 40px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.6875rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                
                .heatmap-cell:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1;
                    position: relative;
                }
                
                .heatmap-branch {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #1E293B;
                    padding: 0.5rem;
                    white-space: nowrap;
                }
                
                /* Quarter Chart */
                .quarter-legend {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                
                .quarter-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8125rem;
                }
                
                .quarter-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                }
                
                /* Loading */
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 6rem 2rem;
                    color: #64748B;
                    gap: 1.5rem;
                }
                
                .loading-spinner {
                    width: 56px;
                    height: 56px;
                    border: 4px solid #E5E7EB;
                    border-top-color: #0F766E;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                
                .loading-text {
                    font-size: 1rem;
                    font-weight: 500;
                }
                
                .loading-subtext {
                    font-size: 0.875rem;
                    color: #94A3B8;
                }
                
                /* Summary Table */
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .summary-table th {
                    background: #F8FAFC;
                    padding: 0.875rem 1rem;
                    text-align: left;
                    font-size: 0.6875rem;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid #E2E8F0;
                }
                
                .summary-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #F1F5F9;
                    font-size: 0.875rem;
                }
                
                .summary-table tbody tr:hover {
                    background: #F8FAFC;
                }
                
                .summary-table tfoot td {
                    background: #F0FDFA;
                    border-top: 2px solid #0F766E;
                    font-weight: 600;
                }
                
                .sparkline {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 24px;
                }
                
                .sparkline-bar {
                    width: 4px;
                    background: #0F766E;
                    border-radius: 2px;
                    transition: all 0.2s;
                }
                
                .sparkline-bar:hover {
                    background: #14B8A6;
                }
                
                @media (max-width: 1280px) {
                    .kpi-section { grid-template-columns: repeat(3, 1fr); }
                }
                
                @media (max-width: 1024px) {
                    .kpi-section { grid-template-columns: repeat(2, 1fr); }
                    .charts-section { grid-template-columns: 1fr; }
                }
                
                @media (max-width: 640px) {
                    .kpi-section { grid-template-columns: 1fr; }
                    .dashboard-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { width: 100%; flex-wrap: wrap; }
                }
            `}</style>

            <div className="sales-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <div className="title-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="title-text">
                            <h1>Sales Analytics Dashboard</h1>
                            <p>Comprehensive overview of all branch performance</p>
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        <div className="view-toggle">
                            <button 
                                className={`view-btn ${viewMode === 'charts' ? 'active' : ''}`}
                                onClick={() => setViewMode('charts')}
                            >
                                <BarChart3 size={16} />
                                Charts
                            </button>
                            <button 
                                className={`view-btn ${viewMode === 'heatmap' ? 'active' : ''}`}
                                onClick={() => setViewMode('heatmap')}
                            >
                                <Sparkles size={16} />
                                Heatmap
                            </button>
                        </div>
                        
                        <div className="year-selector">
                            <Calendar size={16} style={{ color: '#64748B' }} />
                            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                                {[...Array(5)].map((_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>
                        
                        <button 
                            className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
                            onClick={fetchAllBranchData}
                            disabled={refreshing}
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Loading Sales Data</div>
                        <div className="loading-subtext">Fetching data from all branches...</div>
                    </div>
                ) : (
                    <>
                        {/* KPI Section */}
                        <div className="kpi-section">
                            <div className="kpi-card primary">
                                <div className="kpi-header">
                                    <div className="kpi-icon"><DollarSign size={22} /></div>
                                    <div className="kpi-badge up">
                                        <Zap size={12} />
                                        All Branches
                                    </div>
                                </div>
                                <div className="kpi-label">Total Revenue</div>
                                <div className="kpi-value">{formatCurrency(totalRevenue)}</div>
                                <div className="kpi-meta">
                                    <TrendingUp size={14} />
                                    {selectedYear} Annual Sales
                                </div>
                            </div>

                            <div className="kpi-card" style={{ '--kpi-color': '#3B82F6', '--kpi-color-light': '#60A5FA' } as React.CSSProperties}>
                                <div className="kpi-header">
                                    <div className="kpi-icon blue"><ShoppingCart size={22} /></div>
                                    <div className={`kpi-badge ${totalOrders > 0 ? 'up' : 'neutral'}`}>
                                        <Activity size={12} />
                                        Active
                                    </div>
                                </div>
                                <div className="kpi-label">Total Order Days</div>
                                <div className="kpi-value">{totalOrders.toLocaleString()}</div>
                                <div className="kpi-meta">Days with recorded sales</div>
                            </div>

                            <div className="kpi-card" style={{ '--kpi-color': '#F59E0B', '--kpi-color-light': '#FBBF24' } as React.CSSProperties}>
                                <div className="kpi-header">
                                    <div className="kpi-icon amber"><Crown size={22} /></div>
                                    <div className="kpi-badge up">
                                        <Trophy size={12} />
                                        #1
                                    </div>
                                </div>
                                <div className="kpi-label">Top Performer</div>
                                <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{topBranch?.branch || '-'}</div>
                                <div className="kpi-meta">{topBranch ? formatCurrency(topBranch.total) : 'No data'}</div>
                            </div>

                            <div className="kpi-card" style={{ '--kpi-color': '#10B981', '--kpi-color-light': '#34D399' } as React.CSSProperties}>
                                <div className="kpi-header">
                                    <div className="kpi-icon emerald"><Flame size={22} /></div>
                                </div>
                                <div className="kpi-label">Best Month</div>
                                <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{bestMonth?.month || '-'}</div>
                                <div className="kpi-meta">{bestMonth ? formatCurrency(bestMonth.total) : 'No data'}</div>
                            </div>

                            <div className="kpi-card" style={{ '--kpi-color': '#8B5CF6', '--kpi-color-light': '#A78BFA' } as React.CSSProperties}>
                                <div className="kpi-header">
                                    <div className="kpi-icon purple"><Building2 size={22} /></div>
                                </div>
                                <div className="kpi-label">Active Branches</div>
                                <div className="kpi-value">{branchSalesData.filter(b => b.total > 0).length} / {branches.length}</div>
                                <div className="kpi-meta">Branches with sales</div>
                            </div>
                        </div>

                        {viewMode === 'charts' ? (
                            <>
                                {/* Charts Row 1 */}
                                <div className="charts-section">
                                    <div className="chart-card full">
                                        <div className="chart-header">
                                            <div className="chart-title">
                                                <Activity size={18} />
                                                Monthly Sales Trend
                                                <span className="chart-subtitle">All branches comparison</span>
                                            </div>
                                        </div>
                                        <div className="chart-body">
                                            <ResponsiveContainer width="100%" height={320}>
                                                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        {branches.map((branch, index) => (
                                                            <linearGradient key={branch.name} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4}/>
                                                                <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                                                            </linearGradient>
                                                        ))}
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E5E7EB' }} />
                                                    <YAxis tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E5E7EB' }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend 
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        formatter={(value) => <span style={{ color: '#475569', fontSize: '12px', fontWeight: 500 }}>{value}</span>}
                                                    />
                                                    {branches.map((branch, index) => (
                                                        <Area
                                                            key={branch.name}
                                                            type="monotone"
                                                            dataKey={branch.name}
                                                            stroke={COLORS[index % COLORS.length]}
                                                            strokeWidth={2.5}
                                                            fillOpacity={1}
                                                            fill={`url(#gradient${index})`}
                                                        />
                                                    ))}
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row 2 */}
                                <div className="charts-section">
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div className="chart-title">
                                                <BarChart3 size={18} />
                                                Branch Comparison
                                            </div>
                                        </div>
                                        <div className="chart-body">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={branchSalesData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                                                    <defs>
                                                        {branchSalesData.map((_, index) => (
                                                            <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length][0]} />
                                                                <stop offset="100%" stopColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length][1]} />
                                                            </linearGradient>
                                                        ))}
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                    <XAxis dataKey="branch" tick={{ fontSize: 11, fill: '#64748B' }} angle={-45} textAnchor="end" height={80} />
                                                    <YAxis tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748B' }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="total" radius={[8, 8, 0, 0]} name="Total Sales">
                                                        {branchSalesData.map((_, index) => (
                                                            <Cell key={index} fill={`url(#barGradient${index})`} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div className="chart-title">
                                                <Trophy size={18} />
                                                Performance Ranking
                                            </div>
                                        </div>
                                        <div className="ranking-list">
                                            {branchSalesData.slice(0, 5).map((branch, index) => (
                                                <div key={branch.branch} className="ranking-item">
                                                    <div className={`rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}`}>
                                                        {index === 0 ? <Crown size={16} /> : index + 1}
                                                    </div>
                                                    <div className="rank-info">
                                                        <div className="rank-name">{branch.branch}</div>
                                                        <div className="rank-stats">
                                                            <span className="rank-stat">
                                                                <ShoppingCart size={12} />
                                                                {branch.orderCount} orders
                                                            </span>
                                                            <span className="rank-stat">
                                                                {branch.growth >= 0 ? <ArrowUpRight size={12} style={{ color: '#10B981' }} /> : <ArrowDownRight size={12} style={{ color: '#EF4444' }} />}
                                                                {Math.abs(branch.growth).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="rank-progress">
                                                            <div 
                                                                className="rank-progress-bar" 
                                                                style={{ 
                                                                    width: `${(branch.total / (branchSalesData[0]?.total || 1)) * 100}%`,
                                                                    background: `linear-gradient(90deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length][0]}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length][1]})`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="rank-total">{formatCurrency(branch.total)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Row 3 */}
                                <div className="charts-section">
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div className="chart-title">
                                                <PieChartIcon size={18} />
                                                Revenue Distribution
                                            </div>
                                        </div>
                                        <div className="chart-body">
                                            <ResponsiveContainer width="100%" height={280}>
                                                <PieChart>
                                                    <defs>
                                                        {branchSalesData.map((_, index) => (
                                                            <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                                                                <stop offset="0%" stopColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length][0]} />
                                                                <stop offset="100%" stopColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length][1]} />
                                                            </linearGradient>
                                                        ))}
                                                    </defs>
                                                    <Pie
                                                        data={branchSalesData.filter(b => b.total > 0)}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={70}
                                                        outerRadius={110}
                                                        paddingAngle={3}
                                                        dataKey="total"
                                                        nameKey="branch"
                                                    >
                                                        {branchSalesData.map((_, index) => (
                                                            <Cell key={index} fill={`url(#pieGradient${index})`} stroke="white" strokeWidth={2} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend 
                                                        formatter={(value) => <span style={{ color: '#475569', fontSize: '11px' }}>{value}</span>}
                                                        wrapperStyle={{ fontSize: '12px' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div className="chart-title">
                                                <Target size={18} />
                                                Quarterly Performance
                                            </div>
                                        </div>
                                        <div className="chart-body">
                                            <ResponsiveContainer width="100%" height={280}>
                                                <ComposedChart data={quarterlyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                                    <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#64748B' }} />
                                                    <YAxis tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748B' }} />
                                                    <Tooltip content={<RadialTooltip />} />
                                                    <Bar dataKey="total" fill="#0F766E" radius={[8, 8, 0, 0]} name="Quarterly Sales">
                                                        {quarterlyData.map((entry, index) => (
                                                            <Cell 
                                                                key={index} 
                                                                fill={`url(#barGradient${index})`}
                                                            />
                                                        ))}
                                                    </Bar>
                                                    <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Heatmap View */
                            <div className="chart-card full">
                                <div className="chart-header">
                                    <div className="chart-title">
                                        <Sparkles size={18} />
                                        Sales Heatmap
                                        <span className="chart-subtitle">Monthly performance by branch</span>
                                    </div>
                                </div>
                                <div className="heatmap-container">
                                    <table className="heatmap-table">
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', minWidth: '120px' }}>Branch</th>
                                                {months.map(m => <th key={m}>{m}</th>)}
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {heatmapData.map((row, rowIndex) => (
                                                <tr key={row.branch}>
                                                    <td className="heatmap-branch">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[rowIndex % COLORS.length] }}></div>
                                                            {row.branch}
                                                        </div>
                                                    </td>
                                                    {months.map(m => {
                                                        const value = typeof row[m] === 'number' ? row[m] as number : 0;
                                                        const bgColor = getHeatmapColor(value);
                                                        const textColor = value / maxHeatmapValue > 0.5 ? 'white' : '#1E293B';
                                                        return (
                                                            <td key={m}>
                                                                <div 
                                                                    className="heatmap-cell" 
                                                                    style={{ background: bgColor, color: textColor }}
                                                                    title={`${row.branch} - ${m}: ${formatFullCurrency(value)}`}
                                                                >
                                                                    {value > 0 ? formatCurrency(value) : '-'}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                    <td>
                                                        <div style={{ fontWeight: 700, color: '#0F766E', padding: '0.5rem', textAlign: 'center' }}>
                                                            {formatCurrency(branchSalesData.find(b => b.branch === row.branch)?.total || 0)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Summary Table */}
                        <div className="chart-card full" style={{ marginTop: '1rem' }}>
                            <div className="chart-header">
                                <div className="chart-title">
                                    <Building2 size={18} />
                                    Detailed Performance Summary
                                    <span className="chart-subtitle">{selectedYear} Annual Report</span>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="summary-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px' }}>Rank</th>
                                            <th>Branch</th>
                                            <th>Trend</th>
                                            <th style={{ textAlign: 'right' }}>Total Sales</th>
                                            <th style={{ textAlign: 'center' }}>Orders</th>
                                            <th style={{ textAlign: 'right' }}>Avg/Order</th>
                                            <th style={{ textAlign: 'center' }}>Growth</th>
                                            <th style={{ textAlign: 'right' }}>Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branchSalesData.map((branch, index) => (
                                            <tr key={branch.branch}>
                                                <td>
                                                    <span className={`rank-badge ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}`}>
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: `linear-gradient(135deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length][0]}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length][1]})` }}></div>
                                                        <strong>{branch.branch}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="sparkline">
                                                        {branch.monthlyData.map((val, i) => {
                                                            const maxVal = Math.max(...branch.monthlyData);
                                                            const height = maxVal > 0 ? (val / maxVal) * 24 : 2;
                                                            return (
                                                                <div 
                                                                    key={i} 
                                                                    className="sparkline-bar" 
                                                                    style={{ 
                                                                        height: `${Math.max(2, height)}px`,
                                                                        background: `linear-gradient(to top, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length][0]}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length][1]})`
                                                                    }}
                                                                    title={`${months[i]}: ${formatCurrency(val)}`}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#0F766E', fontSize: '1rem' }}>
                                                    {formatFullCurrency(branch.total)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className="badge badge-info">{branch.orderCount}</span>
                                                </td>
                                                <td style={{ textAlign: 'right', color: '#64748B' }}>
                                                    {formatFullCurrency(branch.avgOrder)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`kpi-badge ${branch.growth >= 0 ? 'up' : 'down'}`}>
                                                        {branch.growth >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                        {Math.abs(branch.growth).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className="badge badge-primary" style={{ fontWeight: 600 }}>
                                                        {totalRevenue > 0 ? ((branch.total / totalRevenue) * 100).toFixed(1) : 0}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3}><strong>Total - All Branches</strong></td>
                                            <td style={{ textAlign: 'right', color: '#0F766E', fontSize: '1.125rem' }}><strong>{formatFullCurrency(totalRevenue)}</strong></td>
                                            <td style={{ textAlign: 'center' }}><strong>{totalOrders}</strong></td>
                                            <td style={{ textAlign: 'right' }}><strong>{formatFullCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</strong></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`kpi-badge ${avgGrowth >= 0 ? 'up' : 'down'}`}>
                                                    {avgGrowth >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                    {Math.abs(avgGrowth).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}><strong>100%</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default SalesStatistics;
