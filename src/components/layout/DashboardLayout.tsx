
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ActivitySquare, 
  BarChart4, 
  Cpu, 
  LayoutDashboard, 
  LogOut, 
  Network, 
  Settings, 
  Sliders 
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  onLogout = () => {} 
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen bg-[#f5f7f9]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-5g-pcf flex items-center justify-center">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">5G PCF Dashboard</h1>
              <p className="text-xs text-gray-500">Release 16 Compliant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-gray-700"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-2">
            <TabsList className="grid grid-cols-5 gap-2">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-5g-primary data-[state=active]:text-white">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-5g-primary data-[state=active]:text-white">
                <Network className="w-4 h-4 mr-2" />
                Network Topology
              </TabsTrigger>
              <TabsTrigger value="policy" className="data-[state=active]:bg-5g-primary data-[state=active]:text-white">
                <Sliders className="w-4 h-4 mr-2" />
                Policy Rules
              </TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-5g-primary data-[state=active]:text-white">
                <ActivitySquare className="w-4 h-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-5g-primary data-[state=active]:text-white">
                <BarChart4 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content for all tabs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="bg-white shadow-sm mt-6 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 5G PCF Dashboard | 3GPP Release 16 Compliant
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <span className="status-indicator status-active"></span>
                <span className="text-xs text-gray-600">System Operational</span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
