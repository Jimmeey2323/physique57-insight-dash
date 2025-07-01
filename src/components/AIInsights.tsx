
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, BarChart2, Award, Brain } from 'lucide-react';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { formatCurrency, formatPercentage } from '@/utils/currencyFormatter';

interface AIInsightsProps {
  data: ProcessedTeacherData[];
  isFiltered: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ data, isFiltered }) => {
  const [insights, setInsights] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'trend' }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      generateInsights();
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data]);

  const generateInsights = () => {
    if (!data || data.length === 0) {
      setInsights([{
        message: "Upload and process data files to see AI-driven insights.",
        type: 'info'
      }]);
      return;
    }

    const newInsights: { message: string; type: 'info' | 'success' | 'warning' | 'trend' }[] = [];

    // Filter out summary rows
    const filteredData = data.filter(item => 
      item.teacherName && 
      item.teacherName.toLowerCase() !== 'all trainers' &&
      item.teacherName.toLowerCase() !== 'total' &&
      item.teacherName.toLowerCase() !== 'summary'
    );

    // Calculate overall metrics
    const totalNewClients = filteredData.reduce((sum, item) => sum + item.newClients, 0);
    const totalRetainedClients = filteredData.reduce((sum, item) => sum + item.retainedClients, 0);
    const totalConvertedClients = filteredData.reduce((sum, item) => sum + item.convertedClients, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    const overallRetentionRate = totalNewClients ? (totalRetainedClients / totalNewClients) * 100 : 0;
    const overallConversionRate = totalNewClients ? (totalConvertedClients / totalNewClients) * 100 : 0;
    
    // Find top performing teacher (by conversion rate)
    const topTeacher = [...filteredData].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    
    // Find location with highest retention
    const locationData = filteredData.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = { newClients: 0, retainedClients: 0, convertedClients: 0, revenue: 0 };
      }
      acc[item.location].newClients += item.newClients;
      acc[item.location].retainedClients += item.retainedClients;
      acc[item.location].convertedClients += item.convertedClients;
      acc[item.location].revenue += item.totalRevenue;
      return acc;
    }, {} as Record<string, { newClients: number; retainedClients: number; convertedClients: number; revenue: number }>);
    
    const locationStats = Object.entries(locationData).map(([location, stats]) => ({
      location,
      retentionRate: stats.newClients ? (stats.retainedClients / stats.newClients) * 100 : 0,
      conversionRate: stats.newClients ? (stats.convertedClients / stats.newClients) * 100 : 0,
      revenue: stats.revenue,
      newClients: stats.newClients
    }));
    
    const topLocation = [...locationStats].sort((a, b) => b.retentionRate - a.retentionRate)[0];

    // General insights
    if (isFiltered) {
      newInsights.push({
        message: `Analyzing ${filteredData.length} teacher${filteredData.length !== 1 ? 's' : ''} with ${totalNewClients} new clients from your current filter.`,
        type: 'info'
      });
    } else {
      newInsights.push({
        message: `Your studios acquired ${totalNewClients} new clients with ${formatPercentage(overallRetentionRate)} retention rate.`,
        type: 'info'
      });
    }

    // Success insights
    if (topTeacher && topTeacher.conversionRate > 0) {
      newInsights.push({
        message: `${topTeacher.teacherName} leads with ${formatPercentage(topTeacher.conversionRate)} conversion rate and ${formatCurrency(topTeacher.totalRevenue)} revenue.`,
        type: 'success'
      });
    }
    
    if (topLocation && topLocation.retentionRate > 0) {
      newInsights.push({
        message: `${topLocation.location} excels in retention with ${formatPercentage(topLocation.retentionRate)} rate.`,
        type: 'success'
      });
    }
    
    // Warning insights
    const lowRetentionTeachers = filteredData.filter(teacher => 
      teacher.newClients > 5 && teacher.retentionRate < (overallRetentionRate * 0.7)
    );
    
    if (lowRetentionTeachers.length > 0) {
      newInsights.push({
        message: `${lowRetentionTeachers.length} teacher(s) have retention rates below 70% of team average - needs attention.`,
        type: 'warning'
      });
    }
    
    // Trend insights
    const avgRevenuePerClient = totalConvertedClients ? totalRevenue / totalConvertedClients : 0;
    
    newInsights.push({
      message: `Average revenue per converted client: ${formatCurrency(avgRevenuePerClient)} across all locations.`,
      type: 'trend'
    });
    
    if (totalRevenue > 0) {
      newInsights.push({
        message: `Total team revenue: ${formatCurrency(totalRevenue)} with ${formatPercentage(overallConversionRate)} overall conversion.`,
        type: 'success'
      });
    }

    // Performance distribution insights
    const highPerformers = filteredData.filter(t => t.conversionRate > overallConversionRate * 1.2);
    const lowPerformers = filteredData.filter(t => t.conversionRate < overallConversionRate * 0.6);
    
    if (highPerformers.length > 0) {
      newInsights.push({
        message: `${highPerformers.length} high-performing teachers exceed team average by 20%+ - consider replicating their strategies.`,
        type: 'trend'
      });
    }

    if (lowPerformers.length > 0) {
      newInsights.push({
        message: `${lowPerformers.length} teachers performing 40% below average may benefit from additional training and support.`,
        type: 'warning'
      });
    }
    
    setInsights(newInsights);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'success': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'trend': return <BarChart2 className="h-4 w-4 text-purple-500" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'info': return <Badge variant="info">Insight</Badge>;
      case 'success': return <Badge variant="success">Performance</Badge>;
      case 'warning': return <Badge variant="warning">Opportunity</Badge>;
      case 'trend': return <Badge variant="premium">Trend</Badge>;
      default: return <Badge variant="secondary">Insight</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-lg animate-fade-in bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold">AI Performance Insights</CardTitle>
          </div>
          <Badge variant="premium">Powered by AI</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-[120px]">
            <div className="animate-pulse space-y-3 w-full">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md animate-fade-in ${
                  insight.type === 'info' ? 'bg-blue-50/50 border-blue-200/50' : 
                  insight.type === 'success' ? 'bg-green-50/50 border-green-200/50' : 
                  insight.type === 'warning' ? 'bg-amber-50/50 border-amber-200/50' :
                  'bg-purple-50/50 border-purple-200/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">{getBadge(insight.type)}</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
