
import React, { useEffect, useState } from "react";
import { UdrInstance, discoverUdr } from "@/utils/udrDiscovery";
import CustomCard from "@/components/ui/CustomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Server, Database, Network } from "lucide-react";

interface UdrDiscoveryVisualizerProps {
  initialSupi?: string;
  initialSst?: number;
  initialDnn?: string;
}

const UdrDiscoveryVisualizer: React.FC<UdrDiscoveryVisualizerProps> = ({
  initialSupi = "imsi-123456789012345",
  initialSst = 1,
  initialDnn = "internet"
}) => {
  const [supi, setSupi] = useState(initialSupi);
  const [sst, setSst] = useState(initialSst.toString());
  const [sd, setSd] = useState("000001");
  const [dnn, setDnn] = useState(initialDnn);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredUdr, setDiscoveredUdr] = useState<UdrInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [discoveryHistory, setDiscoveryHistory] = useState<Array<{
    timestamp: Date;
    supi: string;
    result: "success" | "failure";
    udr?: UdrInstance;
  }>>([]);

  async function handleDiscoverUdr() {
    setIsDiscovering(true);
    setError(null);
    
    try {
      const sstNum = parseInt(sst, 10);
      if (isNaN(sstNum)) {
        throw new Error("SST must be a number");
      }
      
      const sliceInfo = {
        sst: sstNum,
        sd: sd || undefined
      };
      
      const result = await discoverUdr(supi, sliceInfo, dnn);
      
      setDiscoveredUdr(result);
      
      setDiscoveryHistory(prev => [
        {
          timestamp: new Date(),
          supi,
          result: result ? "success" : "failure",
          udr: result || undefined
        },
        ...prev.slice(0, 4)  // Keep only the last 5 entries
      ]);
      
      if (!result) {
        setError("No suitable UDR instance found for the given parameters");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setDiscoveredUdr(null);
    } finally {
      setIsDiscovering(false);
    }
  }

  return (
    <CustomCard
      title="UDR Discovery"
      description="Discover UDR instances based on subscriber information"
      headerExtra={
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleDiscoverUdr}
          disabled={isDiscovering}
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${isDiscovering ? "animate-spin" : ""}`} />
          Discover UDR
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Discovery Parameters</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="supi" className="text-xs font-medium">
                  SUPI (Subscriber Permanent Identifier)
                </label>
                <Input
                  id="supi"
                  value={supi}
                  onChange={(e) => setSupi(e.target.value)}
                  placeholder="e.g., imsi-123456789012345"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="sst" className="text-xs font-medium">
                    SST (Slice Type)
                  </label>
                  <Input
                    id="sst"
                    value={sst}
                    onChange={(e) => setSst(e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
                <div>
                  <label htmlFor="sd" className="text-xs font-medium">
                    SD (Slice Differentiator)
                  </label>
                  <Input
                    id="sd"
                    value={sd}
                    onChange={(e) => setSd(e.target.value)}
                    placeholder="e.g., 000001"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dnn" className="text-xs font-medium">
                  DNN (Data Network Name)
                </label>
                <Input
                  id="dnn"
                  value={dnn}
                  onChange={(e) => setDnn(e.target.value)}
                  placeholder="e.g., internet"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Discovery Result</h3>
            {error ? (
              <div className="border border-red-200 rounded-md p-3 bg-red-50 text-red-800 text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            ) : !discoveredUdr ? (
              <div className="border border-gray-200 rounded-md p-3 bg-gray-50 text-gray-500 text-sm">
                No UDR discovery has been performed yet.
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-5g-pcf text-white p-3 text-sm font-medium flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  {discoveredUdr.id}
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium">{discoveredUdr.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <span className="font-medium">{discoveredUdr.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium">{discoveredUdr.capacity}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Supported Features:</span>
                    <div className="flex flex-wrap gap-1">
                      {discoveredUdr.supportedFeatures.map(feature => (
                        <Badge key={feature} variant="outline" className="text-[0.65rem]">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="discovery">Discovery Flow</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discovery" className="p-0 border rounded-md mt-2">
            <div className="p-3">
              <div className="relative">
                {/* NRF to UDR discovery visualization */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-16 h-16 bg-5g-pcf rounded-full flex items-center justify-center text-white font-bold">
                        PCF
                      </div>
                      <span className="text-xs mt-1">Policy Control</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
                        1. Discovery Request
                      </div>
                    </div>
                    <Network className="h-5 w-5 my-2 text-gray-400" />
                    <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
                        2. Discovery Response
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-16 h-16 bg-5g-amf rounded-full flex items-center justify-center text-white font-bold">
                        NRF
                      </div>
                      <span className="text-xs mt-1">Network Repository</span>
                    </div>
                  </div>
                </div>
                
                {/* Data retrieval visualization */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    {/* PCF already rendered above */}
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
                        3. Data Request
                      </div>
                    </div>
                    <Network className="h-5 w-5 my-2 text-gray-400" />
                    <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs text-gray-500">
                        4. Policy Data
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-16 h-16 bg-5g-udr rounded-full flex items-center justify-center text-white font-bold">
                        UDR
                      </div>
                      <span className="text-xs mt-1">User Data Repository</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p className="mb-2">Discovery Process:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>PCF sends a discovery request to NRF to find suitable UDR instances</li>
                  <li>NRF returns available UDR instances based on SUPI and slice information</li>
                  <li>PCF selects the optimal UDR and requests subscriber policy data</li>
                  <li>UDR returns the policy data which PCF uses to make policy decisions</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="p-0 border rounded-md mt-2">
            {discoveryHistory.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">
                No discovery history available.
              </div>
            ) : (
              <div className="divide-y">
                {discoveryHistory.map((entry, index) => (
                  <div key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-500">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                        <div className="text-sm font-medium truncate">{entry.supi}</div>
                      </div>
                      <Badge variant={entry.result === "success" ? "success" : "destructive"}>
                        {entry.result === "success" ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    {entry.udr && (
                      <div className="mt-1 text-xs text-gray-600">
                        Selected UDR: {entry.udr.id}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomCard>
  );
};

export default UdrDiscoveryVisualizer;
