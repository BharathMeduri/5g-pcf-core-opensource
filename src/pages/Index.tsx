
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KpiPanel from "@/components/stats/KpiPanel";
import NetworkTopology from "@/components/network/NetworkTopology";
import PolicyRules from "@/components/policy/PolicyRules";
import SessionMonitor from "@/components/monitoring/SessionMonitor";
import LoginForm from "@/components/auth/LoginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  mockHistoricalPcfMetrics, 
  mockNetworkTopology, 
  mockPcfMetrics, 
  mockPcfSessions, 
  mockPolicyRules 
} from "@/utils/mockData";
import { toast } from "sonner";
import CustomCard from "@/components/ui/CustomCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogin = (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      // In a real app, you would validate credentials against a backend
      if (username && password) {
        setIsAuthenticated(true);
        toast.success("Successfully logged in");
      } else {
        toast.error("Invalid credentials");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f9]">
        <LoginForm onLogin={handleLogin} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="dashboard" className="space-y-6">
          <h2 className="text-2xl font-bold">PCF Dashboard Overview</h2>
          <p className="text-muted-foreground">Policy Control Function key performance indicators and status.</p>
          
          <KpiPanel metrics={mockPcfMetrics} historicalData={mockHistoricalPcfMetrics} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <CustomCard title="Network Topology Overview">
              <NetworkTopology topology={mockNetworkTopology} />
            </CustomCard>
            
            <CustomCard title="Policy Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'QoS Policy', count: 18 },
                      { name: 'Session Management', count: 12 },
                      { name: 'Access & Mobility', count: 8 },
                      { name: 'UE Policy', count: 6 },
                      { name: 'URSP', count: 4 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4e2a84" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CustomCard>
          </div>
          
          <CustomCard title="Session Metrics">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: '12:00', establishment: 40, modification: 15, release: 32 },
                    { name: '13:00', establishment: 42, modification: 16, release: 34 },
                    { name: '14:00', establishment: 45, modification: 18, release: 36 },
                    { name: '15:00', establishment: 43, modification: 17, release: 38 },
                    { name: '16:00', establishment: 44, modification: 19, release: 40 },
                    { name: '17:00', establishment: 42, modification: 18, release: 39 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="establishment" stroke="#0056b3" strokeWidth={2} name="Session Establishment" />
                  <Line type="monotone" dataKey="modification" stroke="#00cc66" strokeWidth={2} name="Session Modification" />
                  <Line type="monotone" dataKey="release" stroke="#ea4335" strokeWidth={2} name="Session Release" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>
        </TabsContent>
        
        <TabsContent value="network">
          <NetworkTopology topology={mockNetworkTopology} />
        </TabsContent>
        
        <TabsContent value="policy">
          <PolicyRules policies={mockPolicyRules} />
        </TabsContent>
        
        <TabsContent value="sessions">
          <SessionMonitor sessions={mockPcfSessions} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">PCF Analytics</h2>
            <p className="text-muted-foreground">Advanced analytics for PCF performance and policy usage.</p>
            
            <div className="grid grid-cols-1 gap-6">
              <CustomCard title="Session Establishment Success Rate">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { date: 'Apr 1', success: 97.8, failure: 2.2 },
                        { date: 'Apr 2', success: 98.2, failure: 1.8 },
                        { date: 'Apr 3', success: 99.1, failure: 0.9 },
                        { date: 'Apr 4', success: 98.7, failure: 1.3 },
                        { date: 'Apr 5', success: 99.3, failure: 0.7 },
                        { date: 'Apr 6', success: 99.5, failure: 0.5 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[90, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="success" stroke="#00cc66" strokeWidth={2} name="Success Rate (%)" />
                      <Line type="monotone" dataKey="failure" stroke="#e53935" strokeWidth={2} name="Failure Rate (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CustomCard>
              
              <CustomCard title="Policy Decision Latency">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { time: '12:00', avg: 8.3, p95: 14.2, p99: 22.5 },
                        { time: '13:00', avg: 7.9, p95: 13.8, p99: 21.9 },
                        { time: '14:00', avg: 8.1, p95: 14.0, p99: 22.1 },
                        { time: '15:00', avg: 8.5, p95: 14.5, p99: 23.0 },
                        { time: '16:00', avg: 8.2, p95: 14.3, p99: 22.7 },
                        { time: '17:00', avg: 8.0, p95: 14.1, p99: 22.3 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avg" fill="#0056b3" name="Average" />
                      <Bar dataKey="p95" fill="#00a3e0" name="95th Percentile" />
                      <Bar dataKey="p99" fill="#4e2a84" name="99th Percentile" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CustomCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Index;
