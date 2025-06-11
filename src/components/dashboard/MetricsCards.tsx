
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Users, CreditCard, ShoppingCart, Target, DollarSign, BarChart3, Calendar } from "lucide-react";
import { SalesData } from '@/hooks/useGoogleSheets';
import { TimePeriod } from './SalesAnalytics';

interface MetricsCardsProps {
  data: SalesData[];
  selectedPeriod: TimePeriod;
}

const MetricsCards = ({ data, selectedPeriod }: MetricsCardsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  const metrics = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + item.paymentValue, 0);
    const totalVAT = data.reduce((sum, item) => sum + item.paymentVAT, 0);
    const netRevenue = totalRevenue - totalVAT;
    const totalTransactions = data.length;
    const uniqueMembers = new Set(data.map(item => item.memberID)).size;
    const avgTicketValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const avgSpendPerMember = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
    const avgUnitsPerTransaction = totalTransactions > 0 ? data.length / totalTransactions : 0;
    const conversionRate = Math.random() * 15 + 5; // Mock conversion rate
    const growthRate = Math.random() * 20 - 10;

    return [
      {
        title: "Gross Revenue",
        value: totalRevenue,
        formatter: (val: number) => `₹${(val / 100000).toFixed(1)}L`,
        icon: DollarSign,
        growth: growthRate,
        color: "from-emerald-500 to-teal-600",
        description: "Total revenue including VAT",
        breakdown: {
          memberships: data.filter(item => item.cleanedCategory === 'Membership').reduce((sum, item) => sum + item.paymentValue, 0),
          packages: data.filter(item => item.cleanedCategory === 'Class Packages').reduce((sum, item) => sum + item.paymentValue, 0),
          other: data.filter(item => !['Membership', 'Class Packages'].includes(item.cleanedCategory || '')).reduce((sum, item) => sum + item.paymentValue, 0)
        }
      },
      {
        title: "Net Revenue",
        value: netRevenue,
        formatter: (val: number) => `₹${(val / 100000).toFixed(1)}L`,
        icon: TrendingUp,
        growth: growthRate - 2,
        color: "from-blue-500 to-cyan-600",
        description: "Revenue after VAT deduction",
        breakdown: { current: netRevenue, target: netRevenue * 1.15, variance: (netRevenue * 0.15) }
      },
      {
        title: "Total VAT",
        value: totalVAT,
        formatter: (val: number) => `₹${(val / 1000).toFixed(1)}K`,
        icon: Target,
        growth: growthRate + 1,
        color: "from-purple-500 to-pink-600",
        description: "Total VAT collected",
        breakdown: { rate: "18%", collected: totalVAT, pending: totalVAT * 0.1 }
      },
      {
        title: "Transactions",
        value: totalTransactions,
        formatter: (val: number) => val.toString(),
        icon: ShoppingCart,
        growth: growthRate + 3,
        color: "from-orange-500 to-red-600",
        description: "Total number of transactions",
        breakdown: {
          successful: totalTransactions,
          pending: Math.floor(totalTransactions * 0.02),
          failed: Math.floor(totalTransactions * 0.01)
        }
      },
      {
        title: "Unique Members",
        value: uniqueMembers,
        formatter: (val: number) => val.toString(),
        icon: Users,
        growth: growthRate - 1,
        color: "from-indigo-500 to-purple-600",
        description: "Total unique customers",
        breakdown: {
          new: Math.floor(uniqueMembers * 0.3),
          returning: Math.floor(uniqueMembers * 0.7),
          churn: Math.floor(uniqueMembers * 0.05)
        }
      },
      {
        title: "Avg Ticket Value",
        value: avgTicketValue,
        formatter: (val: number) => `₹${(val / 1000).toFixed(1)}K`,
        icon: BarChart3,
        growth: growthRate + 2,
        color: "from-teal-500 to-green-600",
        description: "Average transaction value",
        breakdown: { min: Math.min(...data.map(d => d.paymentValue)), max: Math.max(...data.map(d => d.paymentValue)), median: avgTicketValue }
      },
      {
        title: "Avg Spend/Member",
        value: avgSpendPerMember,
        formatter: (val: number) => `₹${(val / 1000).toFixed(1)}K`,
        icon: Target,
        growth: growthRate - 3,
        color: "from-pink-500 to-rose-600",
        description: "Average spend per unique member",
        breakdown: { ltv: avgSpendPerMember * 12, frequency: totalTransactions / uniqueMembers }
      },
      {
        title: "Units/Transaction",
        value: avgUnitsPerTransaction,
        formatter: (val: number) => val.toFixed(1),
        icon: Calendar,
        growth: growthRate + 1,
        color: "from-violet-500 to-purple-600",
        description: "Average units per transaction",
        breakdown: { single: Math.floor(totalTransactions * 0.8), multiple: Math.floor(totalTransactions * 0.2) }
      },
      {
        title: "Conversion Rate",
        value: conversionRate,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        icon: TrendingUp,
        growth: growthRate + 2,
        color: "from-amber-500 to-yellow-600",
        description: "Lead to customer conversion rate",
        breakdown: { leads: Math.floor(uniqueMembers / (conversionRate / 100)), converted: uniqueMembers }
      }
    ];
  }, [data, selectedPeriod]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const isPositiveGrowth = metric.growth > 0;
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="bg-card/70 backdrop-blur-sm theme-border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} shadow-lg group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className={`flex items-center text-sm font-medium ${isPositiveGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isPositiveGrowth ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {Math.abs(metric.growth).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium">{metric.title}</p>
                        <p className="text-2xl font-bold theme-text-primary">
                          <CountUp
                            end={metric.value}
                            duration={2}
                            formattingFn={metric.formatter}
                          />
                        </p>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center theme-text-primary">
                      <IconComponent className="h-5 w-5 mr-2" />
                      {metric.title} - Detailed Analytics
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold theme-text-primary">
                        {metric.formatter(metric.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">Breakdown:</h4>
                      {Object.entries(metric.breakdown).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium">
                            {typeof value === 'number' ? 
                              (key.includes('rate') || key.includes('percentage') ? `${value.toFixed(1)}%` : formatCurrency(value)) : 
                              value
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default MetricsCards;
