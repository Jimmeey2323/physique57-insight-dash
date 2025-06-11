import { useState } from 'react';
import { motion } from 'framer-motion';
import SalesAnalytics from '@/components/dashboard/SalesAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ThemeSelector } from '@/components/ui/theme-selector';

const Index = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: 'P', section: 'Sales Analytics', fullName: 'Sales Analytics' },
    { id: 'funnel', label: '5', section: 'Funnel & Lead Performance', fullName: 'Funnel & Lead Performance' },
    { id: 'retention', label: '7', section: 'New Client Conversion & Retention', fullName: 'Client Retention' },
    { id: 'trainer', label: '', section: 'Trainer Performance & Analytics', fullName: 'Trainer Analytics' },
    { id: 'attendance', label: '', section: 'Class Attendance', fullName: 'Class Attendance' },
    { id: 'promotions', label: '', section: 'Discounts & Promotions', fullName: 'Promotions' },
    { id: 'executive', label: '', section: 'Executive Summary', fullName: 'Executive Summary' }
  ];

  return (
    <ThemeProvider defaultTheme="light" defaultColor="purple">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <h1 className="text-6xl font-bold theme-gradient bg-clip-text text-transparent mb-4">
                  Physique 57 India
                </h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-xl text-muted-foreground"
                >
                  Advanced Analytics Dashboard
                </motion.p>
              </div>
              <ThemeSelector />
            </div>
            
            <motion.div
              animate={{ 
                background: [
                  'linear-gradient(90deg, hsl(var(--theme-primary)) 0%, transparent 50%, hsl(var(--theme-accent)) 100%)',
                  'linear-gradient(90deg, hsl(var(--theme-accent)) 0%, transparent 50%, hsl(var(--theme-primary)) 100%)',
                  'linear-gradient(90deg, hsl(var(--theme-primary)) 0%, transparent 50%, hsl(var(--theme-accent)) 100%)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-1 mx-auto rounded-full"
            />
          </motion.div>

          {/* P57 Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 w-full mb-8 bg-card/50 backdrop-blur-sm border theme-border-primary/30 rounded-2xl p-2 shadow-lg">
              {tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`
                    relative text-center font-bold h-20 rounded-xl transition-all duration-500 flex flex-col items-center justify-center p-2
                    ${activeTab === tab.id 
                      ? 'theme-gradient text-white shadow-lg shadow-primary/25 scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:scale-102'
                    }
                  `}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-2xl font-bold">{tab.label}</span>
                    <span className="text-xs mt-1 opacity-75 leading-tight text-center max-w-full">
                      {tab.fullName}
                    </span>
                  </motion.div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="sales" className="mt-0">
              <SalesAnalytics />
            </TabsContent>

            <TabsContent value="funnel" className="mt-0">
              <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl mb-4">Funnel & Lead Performance</h2>
                <p>Coming Soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="retention" className="mt-0">
              <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl mb-4">New Client Conversion & Retention</h2>
                <p>Coming Soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="trainer" className="mt-0">
              <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl mb-4">Trainer Performance & Analytics</h2>
                <p>Coming Soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl mb-4">Class Attendance</h2>
                <p>Coming Soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="promotions" className="mt-0">
              <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl mb-4">Discounts & Promotions</h2>
                <p>Coming Soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="executive" className="mt-0">
              <div className="text-center py-20 text-muted-foreground">
                <h2 className="text-2xl mb-4">Executive Summary</h2>
                <p>Coming Soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
