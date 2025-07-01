
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, BarChart2, Award } from 'lucide-react';
import { ProcessedTeacherData } from '@/utils/dataProcessor';

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
    }, 500); // Simulate AI processing time
    
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

    // Calculate overall metrics
    const totalNewClients = data.reduce((sum, item) => sum + item.newClients, 0);
    const totalRetainedClients = data.reduce((sum, item) => sum + item.retainedClients, 0);
    const totalConvertedClients = data.reduce((sum, item) => sum + item.convertedClients, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    const overallRetentionRate = totalNewClients ? (totalRetainedClients / totalNewClients) * 100 : 0;
    const overallConversionRate = totalNewClients ? (totalConvertedClients / totalNewClients) * 100 : 0;
    
    // Find top performing teacher (by conversion rate)
    const topTeacher = [...data].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    
    // Find location with highest retention
    const locationData = data.reduce((acc, item) => {
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
    
    // Find most effective client source
    const sourceTypes = ['trials', 'referrals', 'hosted', 'influencerSignups'];
    const sourceData = sourceTypes.map(source => {
      const total = data.reduce((sum, item) => sum + (item[source as keyof ProcessedTeacherData] as number), 0);
      const converted = data.reduce((sum, item) => {
        if (source === 'trials') return sum + (item.trialToMembershipConversion * (item.trials as number) / 100);
        if (source === 'referrals') return sum + (item.referralConversionRate * (item.referrals as number) / 100);
        if (source === 'hosted') return sum;
        if (source === 'influencerSignups') return sum + (item.influencerConversionRate * (item.influencerSignups as number) / 100);
        return sum;
      }, 0);
      
      return {
        source: source.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        total,
        converted,
        conversionRate: total ? (converted / total) * 100 : 0
      };
    });
    
    const topSource = [...sourceData].sort((a, b) => b.conversionRate - a.conversionRate)[0];

    // General insights
    if (isFiltered) {
      newInsights.push({
        message: `Based on your current filter, showing data for ${data.length} teacher${data.length !== 1 ? 's' : ''} with ${totalNewClients} new clients.`,
        type: 'info'
      });
    } else {
      newInsights.push({
        message: `Your studios acquired ${totalNewClients} new clients overall, with a ${overallRetentionRate.toFixed(1)}% retention rate.`,
        type: 'info'
      });
    }

    // Success insights
    if (topTeacher && topTeacher.conversionRate > 0) {
      newInsights.push({
        message: `${topTeacher.teacherName} is your top-performing teacher with a ${topTeacher.conversionRate.toFixed(1)}% conversion rate.`,
        type: 'success'
      });
    }
    
    if (topLocation && topLocation.retentionRate > 0) {
      newInsights.push({
        message: `${topLocation.location} has the highest client retention at ${topLocation.retentionRate.toFixed(1)}%.`,
        type: 'success'
      });
    }
    
    // Warning insights
    const lowRetentionTeachers = data.filter(teacher => 
      teacher.newClients > 5 && teacher.retentionRate < (overallRetentionRate * 0.7)
    );
    
    if (lowRetentionTeachers.length > 0) {
      newInsights.push({
        message: `${lowRetentionTeachers.length} teacher(s) have below-average retention rates, requiring attention.`,
        type: 'warning'
      });
    }
    
    // Trend insights
    if (topSource && topSource.conversionRate > 0) {
      newInsights.push({
        message: `${topSource.source} is your most effective client acquisition channel with ${topSource.conversionRate.toFixed(1)}% conversion.`,
        type: 'trend'
      });
    }
    
    const avgRevenuePerClient = totalConvertedClients ? totalRevenue / totalConvertedClients : 0;
    
    newInsights.push({
      message: `Average revenue per converted client: ₹${avgRevenuePerClient.toLocaleString(undefined, {maximumFractionDigits: 0})}.`,
      type: 'trend'
    });
    
    if (totalRevenue > 0) {
      newInsights.push({
        message: `Total revenue across all teachers: ₹${totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}.`,
        type: 'success'
      });
    }
    
    if (totalConvertedClients > 0) {
      newInsights.push({
        message: `Converted ${totalConvertedClients} clients with an overall conversion rate of ${overallConversionRate.toFixed(1)}%.`,
        type: 'info'
      });
    }
    
    // Add more insights as needed based on the data
    setInsights(newInsights);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'success': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'trend': return <BarChart2 className="h-5 w-5 text-purple-500" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'info': return <Badge variant="info">Insight</Badge>;
      case 'success': return <Badge variant="success">Performance</Badge>;
      case 'warning': return <Badge variant="warning">Opportunity</Badge>;
      case 'trend': return <Badge variant="purple">Trend</Badge>;
      default: return <Badge>Insight</Badge>;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm rounded-lg border shadow-sm mb-6 animate-fade-in">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-medium">AI-Driven Insights</CardTitle>
        </div>
        <Badge variant="premium" className="text-xs px-2.5 py-0.5">Premium</Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[100px]">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                <div className="h-5 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border flex items-start gap-3 hover:shadow-md transition-all duration-200 
                  ${insight.type === 'info' ? 'bg-blue-50 border-blue-200' : 
                    insight.type === 'success' ? 'bg-green-50 border-green-200' : 
                    insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-purple-50 border-purple-200'}`}
              >
                <div className="mt-0.5">
                  {getIcon(insight.type)}
                </div>
                <div>
                  <div className="mb-1">{getBadge(insight.type)}</div>
                  <p className="text-sm">{insight.message}</p>
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
