import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, TrendingUp, TrendingDown, DollarSign, Target, Award, Search, Filter, Eye, BarChart3, PieChart, Calendar, MapPin, User, Percent, Star, Crown, Zap, ArrowUpRight, ArrowDownRight, Minus, Activity, Sparkles, UserCheck, UserPlus, RefreshCcw } from 'lucide-react';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import DrillDownAnalytics from './DrillDownAnalytics';
import PerformanceMetricCard from './cards/PerformanceMetricCard';
import StudioMetricCard from './cards/StudioMetricCard';
import RevenueChart from './charts/RevenueChart';
import ConversionRatesChart from './charts/ConversionRatesChart';
import ClientSourceChart from './charts/ClientSourceChart';
import TableViewOptions from './TableViewOptions';
interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed';
  dataMode: 'teacher' | 'studio';
  onFilterChange: (filters: any) => void;
}
const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
  viewMode,
  dataMode,
  onFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('conversionRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [drillDownData, setDrillDownData] = useState<ProcessedTeacherData | null>(null);
  const [drillDownType, setDrillDownType] = useState<'teacher' | 'studio' | 'location' | 'period' | 'totals'>('teacher');
  const [drillDownMetricType, setDrillDownMetricType] = useState<'conversion' | 'retention' | 'all'>('all');
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['teacherName', 'location', 'period', 'newClients', 'retainedClients', 'retentionRate', 'convertedClients', 'conversionRate', 'totalRevenue', 'trials', 'referrals', 'hosted', 'influencerSignups', 'others', 'averageRevenuePerClient', 'noShowRate', 'lateCancellationRate']);
  const [groupBy, setGroupBy] = useState<string>('none');
  const [activeView, setActiveView] = useState('table');

  // Filter out "All Trainers" rows from the data
  const filteredData = useMemo(() => {
    return data.filter(item => item.teacherName && item.teacherName.toLowerCase() !== 'all trainers' && item.teacherName.toLowerCase() !== 'total' && item.teacherName.toLowerCase() !== 'summary');
  }, [data]);

  // Get unique values for filters
  const uniqueTeachers = useMemo(() => {
    return [...new Set(filteredData.map(item => item.teacherName).filter(Boolean))].sort();
  }, [filteredData]);
  const uniquePeriods = useMemo(() => {
    return [...new Set(filteredData.map(item => item.period).filter(Boolean))].sort();
  }, [filteredData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = filteredData.filter(item => {
      const matchesSearch = !searchTerm || item.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) || item.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !selectedLocation || item.location === selectedLocation;
      const matchesTeacher = !selectedTeacher || item.teacherName === selectedTeacher;
      const matchesPeriod = !selectedPeriod || item.period === selectedPeriod;
      return matchesSearch && matchesLocation && matchesTeacher && matchesPeriod;
    });
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn as keyof ProcessedTeacherData] as number;
        const bValue = b[sortColumn as keyof ProcessedTeacherData] as number;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const aStr = String(aValue || '');
        const bStr = String(bValue || '');
        return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    return filtered;
  }, [filteredData, searchTerm, selectedLocation, selectedTeacher, selectedPeriod, sortColumn, sortDirection]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalNewClients = filteredAndSortedData.reduce((sum, item) => sum + item.newClients, 0);
    const totalRetained = filteredAndSortedData.reduce((sum, item) => sum + item.retainedClients, 0);
    const totalConverted = filteredAndSortedData.reduce((sum, item) => sum + item.convertedClients, 0);
    const totalRevenue = filteredAndSortedData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalTrials = filteredAndSortedData.reduce((sum, item) => sum + (item.trials || 0), 0);
    const totalReferrals = filteredAndSortedData.reduce((sum, item) => sum + (item.referrals || 0), 0);
    const totalHosted = filteredAndSortedData.reduce((sum, item) => sum + (item.hosted || 0), 0);
    const totalInfluencerSignups = filteredAndSortedData.reduce((sum, item) => sum + (item.influencerSignups || 0), 0);
    const totalOthers = filteredAndSortedData.reduce((sum, item) => sum + (item.others || 0), 0);
    const totalNoShows = filteredAndSortedData.reduce((sum, item) => sum + (item.noShows || 0), 0);
    const totalLateCancellations = filteredAndSortedData.reduce((sum, item) => sum + (item.lateCancellations || 0), 0);
    return {
      totalNewClients,
      totalRetained,
      totalConverted,
      totalRevenue,
      totalTrials,
      totalReferrals,
      totalHosted,
      totalInfluencerSignups,
      totalOthers,
      totalNoShows,
      totalLateCancellations,
      avgRetentionRate: totalNewClients > 0 ? totalRetained / totalNewClients * 100 : 0,
      avgConversionRate: totalNewClients > 0 ? totalConverted / totalNewClients * 100 : 0,
      avgRevenuePerClient: totalConverted > 0 ? totalRevenue / totalConverted : 0,
      avgNoShowRate: totalNewClients > 0 ? totalNoShows / totalNewClients * 100 : 0,
      avgLateCancellationRate: totalNewClients > 0 ? totalLateCancellations / totalNewClients * 100 : 0
    };
  }, [filteredAndSortedData]);
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }, [sortColumn]);
  const handleDrillDown = useCallback((rowData: ProcessedTeacherData | null, type: 'teacher' | 'studio' | 'totals' = 'teacher', metricType: 'conversion' | 'retention' | 'all' = 'all') => {
    setDrillDownData(rowData);
    setDrillDownType(type);
    setDrillDownMetricType(metricType);
    setIsDrillDownOpen(true);
  }, []);
  const handleTotalsClick = useCallback(() => {
    // Create a summary object for totals drill down
    const totalsData = {
      teacherName: 'All Teachers Summary',
      location: 'All Locations',
      period: 'All Periods',
      newClients: summaryMetrics.totalNewClients,
      retainedClients: summaryMetrics.totalRetained,
      convertedClients: summaryMetrics.totalConverted,
      retentionRate: summaryMetrics.avgRetentionRate,
      conversionRate: summaryMetrics.avgConversionRate,
      totalRevenue: summaryMetrics.totalRevenue,
      averageRevenuePerClient: summaryMetrics.avgRevenuePerClient,
      trials: summaryMetrics.totalTrials,
      referrals: summaryMetrics.totalReferrals,
      hosted: summaryMetrics.totalHosted,
      influencerSignups: summaryMetrics.totalInfluencerSignups,
      others: summaryMetrics.totalOthers,
      noShowRate: summaryMetrics.avgNoShowRate,
      lateCancellationRate: summaryMetrics.avgLateCancellationRate
    } as ProcessedTeacherData;
    handleDrillDown(totalsData, 'totals', 'all');
  }, [summaryMetrics, handleDrillDown]);
  const getBadge = (rate: number, type: 'retention' | 'conversion' | 'noshow' | 'cancellation') => {
    let thresholds: number[];
    let icons: any[];
    let colors: string[];
    switch (type) {
      case 'retention':
        thresholds = [70, 50, 30];
        icons = [Crown, Star, Zap, TrendingDown];
        colors = ['emerald', 'blue', 'amber', 'red'];
        break;
      case 'conversion':
        thresholds = [25, 15, 8];
        icons = [Crown, Award, Target, TrendingDown];
        colors = ['violet', 'blue', 'amber', 'red'];
        break;
      case 'noshow':
      case 'cancellation':
        thresholds = [15, 10, 5]; // Inverted - higher is worse
        icons = [TrendingDown, Zap, Star, Crown];
        colors = ['red', 'amber', 'blue', 'emerald'];
        break;
      default:
        thresholds = [25, 15, 8];
        icons = [Crown, Award, Target, TrendingDown];
        colors = ['violet', 'blue', 'amber', 'red'];
    }
    const isInverted = type === 'noshow' || type === 'cancellation';
    let level = 0;
    if (isInverted) {
      if (rate <= thresholds[2]) level = 3;else if (rate <= thresholds[1]) level = 2;else if (rate <= thresholds[0]) level = 1;else level = 0;
    } else {
      if (rate >= thresholds[0]) level = 0;else if (rate >= thresholds[1]) level = 1;else if (rate >= thresholds[2]) level = 2;else level = 3;
    }
    const Icon = icons[level];
    const color = colors[level];
    return <Badge className={`bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 px-3 py-1.5 font-semibold`}>
        <Icon className="h-3.5 w-3.5" />
        {safeToFixed(rate, 1)}%
        {level === 0 ? <ArrowUpRight className="h-3 w-3" /> : level === 3 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      </Badge>;
  };
  const availableColumns = ['teacherName', 'location', 'period', 'newClients', 'retainedClients', 'retentionRate', 'convertedClients', 'conversionRate', 'totalRevenue', 'trials', 'referrals', 'hosted', 'influencerSignups', 'others', 'averageRevenuePerClient', 'noShowRate', 'lateCancellationRate'];
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceMetricCard title="Total New Clients" value={summaryMetrics.totalNewClients.toLocaleString()} icon={<Users className="h-5 w-5" />} status="neutral" tooltip="Total number of new clients across all filtered data" />
        <PerformanceMetricCard title="Avg Retention Rate" value={`${safeToFixed(summaryMetrics.avgRetentionRate, 1)}%`} icon={<TrendingUp className="h-5 w-5" />} status={summaryMetrics.avgRetentionRate >= 50 ? "positive" : summaryMetrics.avgRetentionRate >= 30 ? "neutral" : "negative"} tooltip="Average retention rate across all filtered data" />
        <PerformanceMetricCard title="Avg Conversion Rate" value={`${safeToFixed(summaryMetrics.avgConversionRate, 1)}%`} icon={<Target className="h-5 w-5" />} status={summaryMetrics.avgConversionRate >= 15 ? "positive" : summaryMetrics.avgConversionRate >= 8 ? "neutral" : "negative"} tooltip="Average conversion rate across all filtered data" />
        <PerformanceMetricCard title="Total Revenue" value={safeFormatCurrency(summaryMetrics.totalRevenue)} icon={<DollarSign className="h-5 w-5" />} status="positive" tooltip="Total revenue generated across all filtered data" />
      </div>

      {/* Data Table */}
      <Card className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-luxury overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-white/20">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Performance Analytics</span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 font-semibold">
              <Activity className="h-4 w-4 mr-2" />
              {filteredAndSortedData.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table maxHeight="500px">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 border-b border-white/20">
                  {visibleColumns.includes('teacherName') && <TableHead sortable sortDirection={sortColumn === 'teacherName' ? sortDirection : undefined} onSort={() => handleSort('teacherName')} className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Teacher
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('location') && <TableHead sortable sortDirection={sortColumn === 'location' ? sortDirection : undefined} onSort={() => handleSort('location')} className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('period') && <TableHead sortable sortDirection={sortColumn === 'period' ? sortDirection : undefined} onSort={() => handleSort('period')} className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Period
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('newClients') && <TableHead sortable sortDirection={sortColumn === 'newClients' ? sortDirection : undefined} onSort={() => handleSort('newClients')} className="text-white font-semibold text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-4 w-4" />
                        New
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('retainedClients') && <TableHead sortable sortDirection={sortColumn === 'retainedClients' ? sortDirection : undefined} onSort={() => handleSort('retainedClients')} className="text-white font-semibold text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Retained
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('retentionRate') && <TableHead sortable sortDirection={sortColumn === 'retentionRate' ? sortDirection : undefined} onSort={() => handleSort('retentionRate')} className="text-white font-semibold text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Retention %
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('convertedClients') && <TableHead sortable sortDirection={sortColumn === 'convertedClients' ? sortDirection : undefined} onSort={() => handleSort('convertedClients')} className="text-white font-semibold text-center">
                      <div className="flex items-center justify-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Converted
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('conversionRate') && <TableHead sortable sortDirection={sortColumn === 'conversionRate' ? sortDirection : undefined} onSort={() => handleSort('conversionRate')} className="text-white font-semibold text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="h-4 w-4" />
                        Conversion %
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('totalRevenue') && <TableHead sortable sortDirection={sortColumn === 'totalRevenue' ? sortDirection : undefined} onSort={() => handleSort('totalRevenue')} className="text-white font-semibold text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="h-4 w-4" />
                        Revenue
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('trials') && <TableHead sortable sortDirection={sortColumn === 'trials' ? sortDirection : undefined} onSort={() => handleSort('trials')} className="text-white font-semibold text-center">
                      Trials
                    </TableHead>}
                  {visibleColumns.includes('referrals') && <TableHead sortable sortDirection={sortColumn === 'referrals' ? sortDirection : undefined} onSort={() => handleSort('referrals')} className="text-white font-semibold text-center">
                      Referrals
                    </TableHead>}
                  {visibleColumns.includes('hosted') && <TableHead sortable sortDirection={sortColumn === 'hosted' ? sortDirection : undefined} onSort={() => handleSort('hosted')} className="text-white font-semibold text-center">
                      Hosted
                    </TableHead>}
                  {visibleColumns.includes('influencerSignups') && <TableHead sortable sortDirection={sortColumn === 'influencerSignups' ? sortDirection : undefined} onSort={() => handleSort('influencerSignups')} className="text-white font-semibold text-center">
                      Influencer
                    </TableHead>}
                  {visibleColumns.includes('others') && <TableHead sortable sortDirection={sortColumn === 'others' ? sortDirection : undefined} onSort={() => handleSort('others')} className="text-white font-semibold text-center">
                      Others
                    </TableHead>}
                  {visibleColumns.includes('averageRevenuePerClient') && <TableHead sortable sortDirection={sortColumn === 'averageRevenuePerClient' ? sortDirection : undefined} onSort={() => handleSort('averageRevenuePerClient')} className="text-white font-semibold text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Percent className="h-4 w-4" />
                        Avg Rev/Client
                      </div>
                    </TableHead>}
                  {visibleColumns.includes('noShowRate') && <TableHead sortable sortDirection={sortColumn === 'noShowRate' ? sortDirection : undefined} onSort={() => handleSort('noShowRate')} className="text-white font-semibold text-center">
                      No Show %
                    </TableHead>}
                  {visibleColumns.includes('lateCancellationRate') && <TableHead sortable sortDirection={sortColumn === 'lateCancellationRate' ? sortDirection : undefined} onSort={() => handleSort('lateCancellationRate')} className="text-white font-semibold text-center">
                      Late Cancel %
                    </TableHead>}
                  <TableHead className="text-white font-semibold text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((row, index) => <TableRow key={index} className="transition-all duration-200 hover:bg-slate-50/80 border-b border-slate-100/50 cursor-pointer" onClick={() => handleDrillDown(row, 'teacher', 'all')}>
                    {visibleColumns.includes('teacherName') && <TableCell className="font-medium text-slate-800 min-w-[200px]">
                        {row.teacherName}
                      </TableCell>}
                    {visibleColumns.includes('location') && <TableCell className="text-slate-700 min-w-[250px]">
                        {row.location}
                      </TableCell>}
                    {visibleColumns.includes('period') && <TableCell className="text-slate-700 min-w-[75px]">
                        {row.period}
                      </TableCell>}
                    {visibleColumns.includes('newClients') && <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold px-3 py-1 rounded-lg">
                          {row.newClients}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('retainedClients') && <TableCell className="text-center">
                        <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold px-3 py-1 rounded-lg">
                          {row.retainedClients}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('retentionRate') && <TableCell className="text-center">
                        {getBadge(row.retentionRate, 'retention')}
                      </TableCell>}
                    {visibleColumns.includes('convertedClients') && <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold px-3 py-1 rounded-lg">
                          {row.convertedClients}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('conversionRate') && <TableCell className="text-center">
                        {getBadge(row.conversionRate, 'conversion')}
                      </TableCell>}
                    {visibleColumns.includes('totalRevenue') && <TableCell className="text-right font-semibold text-slate-800">
                        {safeFormatCurrency(row.totalRevenue)}
                      </TableCell>}
                    {visibleColumns.includes('trials') && <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {row.trials || 0}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('referrals') && <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {row.referrals || 0}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('hosted') && <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {row.hosted || 0}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('influencerSignups') && <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {row.influencerSignups || 0}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('others') && <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          {row.others || 0}
                        </Badge>
                      </TableCell>}
                    {visibleColumns.includes('averageRevenuePerClient') && <TableCell className="text-right font-semibold text-slate-800">
                        {safeFormatCurrency(row.averageRevenuePerClient)}
                      </TableCell>}
                    {visibleColumns.includes('noShowRate') && <TableCell className="text-center">
                        {getBadge(row.noShowRate || 0, 'noshow')}
                      </TableCell>}
                    {visibleColumns.includes('lateCancellationRate') && <TableCell className="text-center">
                        {getBadge(row.lateCancellationRate || 0, 'cancellation')}
                      </TableCell>}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={e => {
                      e.stopPropagation();
                      handleDrillDown(row, 'teacher', 'all');
                    }} className="bg-white/90 hover:bg-white border-slate-200 hover:border-primary/50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
              <TableFooter>
                <TableRow className="border-t-2 border-slate-300/50 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 cursor-pointer hover:from-slate-700/95 hover:via-slate-600/95 hover:to-slate-700/95 transition-all duration-200" onClick={handleTotalsClick} isClickable={true}>
                  {visibleColumns.includes('teacherName') && <TableCell className="font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>TOTALS</span>
                      </div>
                    </TableCell>}
                  {visibleColumns.includes('location') && <TableCell className="font-bold text-white">-</TableCell>}
                  {visibleColumns.includes('period') && <TableCell className="font-bold text-white">-</TableCell>}
                  {visibleColumns.includes('newClients') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalNewClients}</TableCell>}
                  {visibleColumns.includes('retainedClients') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalRetained}</TableCell>}
                  {visibleColumns.includes('retentionRate') && <TableCell className="text-center font-bold text-white">{safeToFixed(summaryMetrics.avgRetentionRate, 1)}%</TableCell>}
                  {visibleColumns.includes('convertedClients') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalConverted}</TableCell>}
                  {visibleColumns.includes('conversionRate') && <TableCell className="text-center font-bold text-white">{safeToFixed(summaryMetrics.avgConversionRate, 1)}%</TableCell>}
                  {visibleColumns.includes('totalRevenue') && <TableCell className="text-right font-bold text-white">{safeFormatCurrency(summaryMetrics.totalRevenue)}</TableCell>}
                  {visibleColumns.includes('trials') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalTrials}</TableCell>}
                  {visibleColumns.includes('referrals') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalReferrals}</TableCell>}
                  {visibleColumns.includes('hosted') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalHosted}</TableCell>}
                  {visibleColumns.includes('influencerSignups') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalInfluencerSignups}</TableCell>}
                  {visibleColumns.includes('others') && <TableCell className="text-center font-bold text-white">{summaryMetrics.totalOthers}</TableCell>}
                  {visibleColumns.includes('averageRevenuePerClient') && <TableCell className="text-right font-bold text-white">{safeFormatCurrency(summaryMetrics.avgRevenuePerClient)}</TableCell>}
                  {visibleColumns.includes('noShowRate') && <TableCell className="text-center font-bold text-white">{safeToFixed(summaryMetrics.avgNoShowRate, 1)}%</TableCell>}
                  {visibleColumns.includes('lateCancellationRate') && <TableCell className="text-center font-bold text-white">{safeToFixed(summaryMetrics.avgLateCancellationRate, 1)}%</TableCell>}
                  <TableCell className="text-center font-bold text-white">
                    <Eye className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          
          {/* Summary Footer */}
          <div className="p-4 bg-gray-50 border-t">
            <h4 className="font-semibold text-gray-800 mb-2">Table Summary:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>{filteredAndSortedData.length}</strong> teachers displayed with filtered data</li>
              <li>• Total new clients: <strong>{summaryMetrics.totalNewClients.toLocaleString()}</strong></li>
              <li>• Average conversion rate: <strong>{safeToFixed(summaryMetrics.avgConversionRate, 1)}%</strong></li>
              <li>• Average retention rate: <strong>{safeToFixed(summaryMetrics.avgRetentionRate, 1)}%</strong></li>
              <li>• Total revenue generated: <strong>{safeFormatCurrency(summaryMetrics.totalRevenue)}</strong></li>
              <li>• Click on the totals row to view detailed drill-down analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Drill Down Modal */}
      <DrillDownAnalytics isOpen={isDrillDownOpen} onClose={() => setIsDrillDownOpen(false)} data={drillDownData} type={drillDownType} metricType={drillDownMetricType} />
    </div>;
};
export default ResultsTable;