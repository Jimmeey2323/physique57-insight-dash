
import { useState } from 'react';
import { motion } from 'framer-motion';
import SalesAnalytics from '@/components/dashboard/SalesAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: 'P', section: 'Sales Analytics' },
    { id: 'funnel', label: '5', section: 'Funnel & Lead Performance' },
    { id: 'retention', label: '7', section: 'New Client Conversion & Retention' },
    { id: 'trainer', label: '', section: 'Trainer Performance & Analytics' },
    { id: 'attendance', label: '', section: 'Class Attendance' },
    { id: 'promotions', label: '', section: 'Discounts & Promotions' },
    { id: 'executive', label: '', section: 'Executive Summary' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Physique 57 India
          </h1>
          <p className="text-xl text-slate-300">Advanced Analytics Dashboard</p>
        </motion.div>

        {/* P57 Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 w-full mb-8 bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-2">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  relative text-2xl font-bold h-16 rounded-xl transition-all duration-500
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-3xl">{tab.label}</span>
                  <span className="text-xs mt-1 opacity-75">{tab.section.split(' ')[0]}</span>
                </motion.div>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="sales" className="mt-0">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="funnel" className="mt-0">
            <div className="text-center py-20 text-slate-400">
              <h2 className="text-2xl mb-4">Funnel & Lead Performance</h2>
              <p>Coming Soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="mt-0">
            <div className="text-center py-20 text-slate-400">
              <h2 className="text-2xl mb-4">New Client Conversion & Retention</h2>
              <p>Coming Soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="trainer" className="mt-0">
            <div className="text-center py-20 text-slate-400">
              <h2 className="text-2xl mb-4">Trainer Performance & Analytics</h2>
              <p>Coming Soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <div className="text-center py-20 text-slate-400">
              <h2 className="text-2xl mb-4">Class Attendance</h2>
              <p>Coming Soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="promotions" className="mt-0">
            <div className="text-center py-20 text-slate-400">
              <h2 className="text-2xl mb-4">Discounts & Promotions</h2>
              <p>Coming Soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="executive" className="mt-0">
            <div className="text-center py-20 text-slate-400">
              <h2 className="text-2xl mb-4">Executive Summary</h2>
              <p>Coming Soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
