
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ComposedChart, Line, LineChart, Area, AreaChart } from 'recharts';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { Target, Award, TrendingUp, TrendingDown, Users, Star, AlertTriangle, CheckCircle, Activity, DollarSign, Percent, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { safeToFixed } from '@/lib/utils';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/currencyFormatter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

interface PerformanceInsightsViewProps {
  data: ProcessedTeacherData[];
}

const PerformanceInsightsView: React.FC<PerformanceInsightsViewProps> = ({
  data
}) => {
  // Performance analysis calculations - filter out "All Trainers" rows
  const performanceData = React.useMemo(() => {
    // Filter out any "All Trainers" or summary rows
    const filteredData = data.filter(item => 
      item.teacherName && 
      item.teacherName.toLowerCase() !== 'all trainers' &&
      item.teacherName.toLowerCase() !== 'total' &&
      item.teacherName.toLowerCase() !== 'summary'
    );

    // Group by teacher and calculate performance metrics
    const teacherPerformance = filteredData.reduce((acc, item) => {
      if (!acc[item.teacherName]) {
        acc[item.teacherName] = {
          teacherName: item.teacherName,
          location: item.location,
          totalRevenue: 0,
          totalVisits: 0,
          newClients: 0,
          convertedClients: 0,
          retainedClients: 0,
          noShows: 0,
          cancellations: 0,
          totalClasses: 0,
          trials: 0,
          referrals: 0,
          hosted: 0,
          influencerSignups: 0
        };
      }
      const teacher = acc[item.teacherName];
      teacher.totalRevenue += item.totalRevenue || 0;
      teacher.totalVisits += item.totalVisits || 0;
      teacher.newClients += item.newClients || 0;
      teacher.convertedClients += item.convertedClients || 0;
      teacher.retainedClients += item.retainedClients || 0;
      teacher.noShows += item.noShows || 0;
      teacher.cancellations += item.cancellations || 0;
      teacher.totalClasses += item.totalClasses || 0;
      teacher.trials += item.trials || 0;
      teacher.referrals += item.referrals || 0;
      teacher.hosted += item.hosted || 0;
      teacher.influencerSignups += item.influencerSignups || 0;
      return acc;
    }, {} as Record<string, any>);

    // Calculate performance scores and rankings
    return Object.values(teacherPerformance).map((teacher: any) => {
      const conversionRate = teacher.newClients > 0 ? teacher.convertedClients / teacher.newClients * 100 : 0;
      const retentionRate = teacher.newClients > 0 ? teacher.retainedClients / teacher.newClients * 100 : 0;
      const noShowRate = teacher.totalVisits > 0 ? teacher.noShows / teacher.totalVisits * 100 : 0;
      const cancellationRate = teacher.totalVisits > 0 ? teacher.cancellations / teacher.totalVisits * 100 : 0;
      const revenuePerClient = teacher.newClients > 0 ? teacher.totalRevenue / teacher.newClients : 0;
      const classUtilization = teacher.totalClasses > 0 ? teacher.totalVisits / teacher.totalClasses : 0;

      // Enhanced performance score calculation
      const performanceScore = (
        conversionRate * 0.3 + 
        retentionRate * 0.3 + 
        (100 - noShowRate) * 0.15 + 
        (100 - cancellationRate) * 0.15 + 
        Math.min(revenuePerClient / 1000, 100) * 0.1
      );
      
      return {
        ...teacher,
        conversionRate: safeToFixed(conversionRate, 1),
        retentionRate: safeToFixed(retentionRate, 1),
        noShowRate: safeToFixed(noShowRate, 1),
        cancellationRate: safeToFixed(cancellationRate, 1),
        revenuePerClient: safeToFixed(revenuePerClient, 0),
        classUtilization: safeToFixed(classUtilization, 1),
        performanceScore: safeToFixed(performanceScore, 1)
      };
    }).sort((a, b) => parseFloat(b.performanceScore) - parseFloat(a.performanceScore));
  }, [data]);

  // Enhanced analytics
  const analytics = React.useMemo(() => {
    const totalTeachers = performanceData.length;
    const avgPerformance = performanceData.reduce((sum, p) => sum + parseFloat(p.performanceScore), 0) / totalTeachers;
    
    const highPerformers = performanceData.filter(p => parseFloat(p.performanceScore) > avgPerformance + 15);
    const lowPerformers = performanceData.filter(p => parseFloat(p.performanceScore) < avgPerformance - 15);
    const avgPerformers = totalTeachers - highPerformers.length - lowPerformers.length;
    
    const totals = performanceData.reduce((acc, teacher) => {
      acc.totalRevenue += teacher.totalRevenue;
      acc.newClients += teacher.newClients;
      acc.convertedClients += teacher.convertedClients;
      acc.retainedClients += teacher.retainedClients;
      acc.noShows += teacher.noShows;
      acc.totalVisits += teacher.totalVisits;
      return acc;
    }, { totalRevenue: 0, newClients: 0, convertedClients: 0, retainedClients: 0, noShows: 0, totalVisits: 0 });

    return {
      totalTeachers,
      avgPerformance,
      highPerformers,
      lowPerformers,
      avgPerformers,
      totals,
      avgConversionRate: totals.newClients > 0 ? totals.convertedClients / totals.newClients * 100 : 0,
      avgRetentionRate: totals.newClients > 0 ? totals.retainedClients / totals.newClients * 100 : 0,
      avgNoShowRate: totals.totalVisits > 0 ? totals.noShows / totals.totalVisits * 100 : 0,
      revenuePerTeacher: totals.totalRevenue / totalTeachers,
      topPerformer: performanceData[0]
    };
  }, [performanceData]);

  const chartConfig = {
    performanceScore: { label: 'Performance Score', color: '#3b82f6' },
    conversionRate: { label: 'Conversion Rate', color: '#10b981' },
    retentionRate: { label: 'Retention Rate', color: '#8b5cf6' },
    revenue: { label: 'Revenue', color: '#f59e0b' }
  };

  const performanceDistribution = [
    { name: 'High Performers', value: analytics.highPerformers.length, color: '#10b981' },
    { name: 'Average Performers', value: analytics.avgPerformers, color: '#3b82f6' },
    { name: 'Needs Improvement', value: analytics.lowPerformers.length, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 animate-fade-in">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-blue-900">Top Performer</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-bold text-blue-900">{analytics.topPerformer?.teacherName || 'N/A'}</div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{analytics.topPerformer?.performanceScore || 0} score</Badge>
                <span className="text-xs text-blue-700">{analytics.topPerformer?.location || ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-green-900">Total Revenue</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-900">{formatCurrency(analytics.totals.totalRevenue)}</div>
              <div className="text-xs text-green-700">Avg per teacher: {formatCurrency(analytics.revenuePerTeacher)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-purple-900">Team Performance</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-900">{safeToFixed(analytics.avgPerformance, 1)}</div>
              <Progress value={analytics.avgPerformance} className="h-2 bg-purple-200" />
              <div className="text-xs text-purple-700">Average score</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-amber-900">Conversion Rate</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-amber-900">{formatPercentage(analytics.avgConversionRate)}</div>
              <div className="text-xs text-amber-700">{formatNumber(analytics.totals.convertedClients)} of {formatNumber(analytics.totals.newClients)} clients</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in border-0 shadow-lg" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-500" />
              Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-0 shadow-lg" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-green-500" />
              Revenue vs Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={performanceData.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="performanceScore" 
                    name="Performance Score"
                    className="text-xs"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="totalRevenue" 
                    name="Revenue"
                    className="text-xs"
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name, props) => [
                        name === 'totalRevenue' ? formatCurrency(value as number) : value,
                        name === 'totalRevenue' ? 'Revenue' : 'Performance Score'
                      ]}
                      labelFormatter={(_, props) => props?.[0]?.payload?.teacherName || ''}
                    />}
                  />
                  <Scatter dataKey="totalRevenue" fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Performance Table */}
      <Card className="animate-fade-in border-0 shadow-lg" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-purple-500" />
            Detailed Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table maxHeight="600px">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-800 to-slate-900">
                <TableHead className="text-center text-white font-medium">#</TableHead>
                <TableHead className="text-white font-medium">Teacher</TableHead>
                <TableHead className="text-white font-medium">Location</TableHead>
                <TableHead className="text-center text-white font-medium">Score</TableHead>
                <TableHead className="text-center text-white font-medium">Revenue</TableHead>
                <TableHead className="text-center text-white font-medium">Clients</TableHead>
                <TableHead className="text-center text-white font-medium">Conv %</TableHead>
                <TableHead className="text-center text-white font-medium">Ret %</TableHead>
                <TableHead className="text-center text-white font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((teacher, index) => {
                const isHigh = analytics.highPerformers.includes(teacher);
                const isLow = analytics.lowPerformers.includes(teacher);
                return (
                  <TableRow key={teacher.teacherName} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {index < 3 ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">{index + 1}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{teacher.teacherName}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{teacher.location}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-slate-900">{teacher.performanceScore}</span>
                        {parseFloat(teacher.performanceScore) > analytics.avgPerformance ? 
                          <TrendingUp className="h-3 w-3 text-green-500" /> : 
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-900">
                      {formatCurrency(teacher.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{teacher.newClients}</div>
                        <div className="text-xs text-slate-500">{teacher.convertedClients} conv</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="conversion">{teacher.conversionRate}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="retention">{teacher.retentionRate}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={isHigh ? "success" : isLow ? "destructive" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {isHigh ? <Star className="h-3 w-3" /> : isLow ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        {isHigh ? 'Excellence' : isLow ? 'Support' : 'Good'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gradient-to-r from-slate-800 to-slate-900">
                <TableCell className="font-bold text-white text-center" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>TEAM TOTALS</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-white">{analytics.totalTeachers} teachers</TableCell>
                <TableCell className="text-center font-bold text-white">{safeToFixed(analytics.avgPerformance, 1)}</TableCell>
                <TableCell className="text-center font-bold text-white">{formatCurrency(analytics.totals.totalRevenue)}</TableCell>
                <TableCell className="text-center font-bold text-white">{analytics.totals.newClients}</TableCell>
                <TableCell className="text-center font-bold text-white">{formatPercentage(analytics.avgConversionRate)}</TableCell>
                <TableCell className="text-center font-bold text-white">{formatPercentage(analytics.avgRetentionRate)}</TableCell>
                <TableCell className="text-center font-bold text-white">
                  <Badge variant="info">Active</Badge>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceInsightsView;
