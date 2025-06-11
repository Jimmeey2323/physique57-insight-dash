
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, TrendingDown } from "lucide-react";
import { SalesData } from '@/hooks/useGoogleSheets';

interface TopBottomSellersProps {
  data: SalesData[];
}

const TopBottomSellers = ({ data }: TopBottomSellersProps) => {
  const sellerStats = useMemo(() => {
    const categories = ['cleanedProduct', 'cleanedCategory', 'customerName', 'soldBy'];
    
    return categories.map(category => {
      const stats = data.reduce((acc, item) => {
        const key = item[category as keyof SalesData] as string;
        if (!key) return acc;
        
        if (!acc[key]) {
          acc[key] = {
            name: key,
            revenue: 0,
            units: 0,
            transactions: 0
          };
        }
        
        acc[key].revenue += item.paymentValue;
        acc[key].units += 1;
        acc[key].transactions += 1;
        
        return acc;
      }, {} as Record<string, any>);
      
      const sorted = Object.values(stats).sort((a: any, b: any) => b.revenue - a.revenue);
      
      return {
        category: category.replace('cleaned', '').replace(/([A-Z])/g, ' $1').trim(),
        top: sorted.slice(0, 5),
        bottom: sorted.slice(-5).reverse()
      };
    });
  }, [data]);

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
  };

  const calculateATV = (revenue: number, transactions: number) => {
    return transactions > 0 ? revenue / transactions : 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {sellerStats.map((stat, index) => (
        <motion.div
          key={stat.category}
          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="space-y-6"
        >
          {/* Top Sellers */}
          <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-green-400">
                <Crown className="h-5 w-5 mr-2" />
                Top {stat.category} Sellers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stat.top.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-yellow-500 text-black' :
                      i === 1 ? 'bg-gray-400 text-black' :
                      i === 2 ? 'bg-orange-500 text-black' :
                      'bg-slate-600 text-white'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-32">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-slate-400">ATV: {formatCurrency(calculateATV(item.revenue, item.transactions))}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bottom Sellers */}
          <Card className="bg-slate-800/50 border-red-500/30 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-red-400">
                <TrendingDown className="h-5 w-5 mr-2" />
                Bottom {stat.category} Sellers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stat.bottom.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-white">
                      {stat.top.length - i}
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-32">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.transactions} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-slate-400">ATV: {formatCurrency(calculateATV(item.revenue, item.transactions))}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default TopBottomSellers;
