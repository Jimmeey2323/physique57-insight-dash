
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import MetricsCards from './MetricsCards';
import TopBottomSellers from './TopBottomSellers';
import SalesDataTables from './SalesDataTables';
import SalesCharts from './SalesCharts';
import FilterSection from './FilterSection';

const SalesAnalytics = () => {
  const { data, loading, error } = useGoogleSheets();
  const [selectedLocation, setSelectedLocation] = useState('Kwality House, Kemps Corner');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: 'all',
    product: 'all',
    soldBy: 'all'
  });

  const locations = [
    'Kwality House, Kemps Corner',
    'Supreme HQ, Bandra',
    'Kenkere House'
  ];

  const filteredData = useMemo(() => {
    return data.filter(item => item.calculatedLocation === selectedLocation);
  }, [data, selectedLocation]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Sales Analytics
        </h2>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
        />
      </motion.div>

      {/* Location Tabs */}
      <Tabs value={selectedLocation} onValueChange={setSelectedLocation} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-1">
          {locations.map((location) => (
            <TabsTrigger
              key={location}
              value={location}
              className={`
                text-sm font-medium h-12 rounded-lg transition-all duration-300
                ${selectedLocation === location 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              {location.split(',')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {locations.map((location) => (
          <TabsContent key={location} value={location} className="mt-8 space-y-8">
            {/* Filter Section */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-slate-800/50 border-purple-500/30 text-white hover:bg-slate-700/50"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filters
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <FilterSection filters={filters} setFilters={setFilters} data={filteredData} />
              </CollapsibleContent>
            </Collapsible>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-400">Loading sales data...</p>
              </div>
            ) : (
              <>
                {/* Metrics Cards */}
                <MetricsCards data={filteredData} />

                {/* Top/Bottom Sellers */}
                <TopBottomSellers data={filteredData} />

                {/* Charts */}
                <SalesCharts data={filteredData} />

                {/* Data Tables */}
                <SalesDataTables data={filteredData} />
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;
