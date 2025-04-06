
import React from "react";
import { PcfMetrics } from "@/utils/pcfTypes";
import CustomCard from "@/components/ui/CustomCard";
import { ArrowDownIcon, ArrowUpIcon, CpuIcon, HardDriveIcon, MemoryStickIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface KpiPanelProps {
  metrics: PcfMetrics;
  historicalData?: any;
}

const KpiPanel: React.FC<KpiPanelProps> = ({ metrics, historicalData }) => {
  // Format historical data for charts
  const sessionData = historicalData ? historicalData.timestamps.map((time: string, index: number) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sessions: historicalData.activeSessions[index],
  })) : [];

  const policyEvalData = historicalData ? historicalData.timestamps.map((time: string, index: number) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    evaluations: historicalData.policyEvaluations[index],
  })) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Active Sessions */}
      <CustomCard 
        title="Active Sessions" 
        description={`${metrics.activeSessions.toLocaleString()} sessions`}
        headerExtra={
          <div className="bg-green-50 text-green-700 rounded-full px-2 py-1 text-xs flex items-center">
            <ArrowUpIcon className="w-3 h-3 mr-1" /> 1.2%
          </div>
        }
      >
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0056b3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0056b3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stroke="#0056b3" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#sessionGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CustomCard>

      {/* Policy Evaluations */}
      <CustomCard 
        title="Policy Evaluations" 
        description={`${metrics.policyEvaluationsPerSecond.toFixed(1)} per second`}
        headerExtra={
          <div className="bg-red-50 text-red-700 rounded-full px-2 py-1 text-xs flex items-center">
            <ArrowDownIcon className="w-3 h-3 mr-1" /> 0.8%
          </div>
        }
      >
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={policyEvalData}>
              <defs>
                <linearGradient id="policyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4e2a84" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4e2a84" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="evaluations" 
                stroke="#4e2a84" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#policyGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CustomCard>

      {/* Active Policies */}
      <CustomCard 
        title="Active Policies" 
        description={`${metrics.numberOfActivePolicies} policies`}
      >
        <div className="text-5xl font-bold text-5g-pcf">
          {metrics.numberOfActivePolicies}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-medium text-5g-pcf">+3</span> new policies since yesterday
        </div>
      </CustomCard>

      {/* Resource Utilization */}
      <CustomCard 
        title="Resource Utilization" 
        description="System resources"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CpuIcon className="w-4 h-4 mr-2 text-5g-primary" />
              <span className="text-sm">CPU</span>
            </div>
            <span className="text-sm font-medium">{metrics.cpuUtilization}%</span>
          </div>
          <Progress value={metrics.cpuUtilization} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MemoryStickIcon className="w-4 h-4 mr-2 text-5g-secondary" />
              <span className="text-sm">Memory</span>
            </div>
            <span className="text-sm font-medium">{metrics.memoryUtilization}%</span>
          </div>
          <Progress value={metrics.memoryUtilization} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HardDriveIcon className="w-4 h-4 mr-2 text-5g-accent" />
              <span className="text-sm">Disk</span>
            </div>
            <span className="text-sm font-medium">{metrics.diskUtilization}%</span>
          </div>
          <Progress value={metrics.diskUtilization} className="h-2" />
        </div>
      </CustomCard>
    </div>
  );
};

export default KpiPanel;
