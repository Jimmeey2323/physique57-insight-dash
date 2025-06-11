
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Users, CreditCard, ShoppingCart, Target } from "lucide-react";
import { SalesData } from '@/hooks/useGoogleSheets';

interface MetricsCardsProps {
  data: SalesData[];
}

const MetricsCards = ({ data }: MetricsCardsProps) => {
  const metrics = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + item.paymentValue, 0);
    const totalVAT = data.reduce((sum, item) => sum + item.paymentVAT, 0);
    const netRevenue = totalRevenue - totalVAT;
    const totalTransactions = data.length;
    const uniqueMembers = new Set(data.map(item => item.memberID)).size;
    const avgTicketValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const avgSpendPerMember = uniqueMembers > 0 ? totalRevenue / uniqueMembers : 0;
    
    // Calculate growth (mock data for demonstration)
    const growthRate = Math.random() * 20 - 10; // Random growth between -10% and +10%

    return [
      {
        title: "Gross Revenue",
        value: totalRevenue,
        formatter: (val: number) => `₹${(val / 100000).toFixed(1)}L`,
        icon: TrendingUp,
        growth: growthRate,
        color: "from-green-500 to-emerald-600"
      },
      {
        title: "Net Revenue",
        value: netRevenue,
        formatter: (val: number) => `₹${(val / 100000).toFixed(1)}L`,
        icon: CreditCard,
        growth: growthRate - 2,
        color: "from-blue-500 to-cyan-600"
      },
      {
        title: "Total VAT",
        value: totalVAT,
        formatter: (val: number) => `₹${(val / 1000).toFixed(1)}K`,
        icon: Target,
        growth: growthRate + 1,
        color: "from-purple-500 to-pink-600"
      },
      {
        title: "Transactions",
        value: totalTransactions,
        formatter: (val: number) => val.toString(),
        icon: ShoppingCart,
        growth: growthRate + 3,
        color: "from-orange-500 to-red-600"
      },
      {
        title: "Unique Members",
        value: uniqueMembers,
        formatter: (val: number) => val.toString(),
        icon: Users,
        growth: growthRate - 1,
        color: "from-indigo-500 to-purple-600"
      },
      {
        title: "Avg Ticket Value",
        value: avgTicketValue,
        formatter: (val: number) => `₹${(val / 1000).toFixed(1)}K`,
        icon: TrendingUp,
        growth: growthRate + 2,
        color: "from-teal-500 to-green-600"
      },
      {
        title: "Avg Spend/Member",
        value: avgSpendPerMember,
        formatter: (val: number) => `₹${(val / 1000).toFixed(1)}K`,
        icon: Target,
        growth: growthRate - 3,
        color: "from-pink-500 to-rose-600"
      }
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        const isPositiveGrowth = metric.growth > 0;
        
        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center text-sm ${isPositiveGrowth ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositiveGrowth ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(metric.growth).toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 font-medium">{metric.title}</p>
                  <p className="text-2xl font-bold text-white">
                    <CountUp
                      end={metric.value}
                      duration={2}
                      formattingFn={metric.formatter}
                    />
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
