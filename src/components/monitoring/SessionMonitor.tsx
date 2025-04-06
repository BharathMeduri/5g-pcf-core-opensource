
import React, { useState } from "react";
import { PcfSession } from "@/utils/pcfTypes";
import CustomCard from "@/components/ui/CustomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Info, MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SessionMonitorProps {
  sessions: PcfSession[];
}

const SessionMonitor: React.FC<SessionMonitorProps> = ({ sessions }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<PcfSession | null>(null);
  const [tabValue, setTabValue] = useState("all");

  // Filter sessions based on search query and tab value
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         session.supi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = tabValue === "all" || 
                       (tabValue === "active" && session.status === "active") ||
                       (tabValue === "inactive" && session.status === "inactive") ||
                       (tabValue === "pending" && session.status === "pending");
    
    return matchesSearch && matchesTab;
  });

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <CustomCard 
        title="Session Monitor" 
        description="Monitor active PCF sessions"
        headerExtra={
          <Button variant="outline" size="sm" className="flex items-center">
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by Session ID or SUPI..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" value={tabValue} onValueChange={setTabValue}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Session list */}
          <div className="rounded-md border">
            <div className="bg-muted/50 p-2 grid grid-cols-12 text-xs font-medium text-muted-foreground">
              <div className="col-span-3">Session ID</div>
              <div className="col-span-4">SUPI</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1">Actions</div>
            </div>
            {filteredSessions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No sessions found.
              </div>
            ) : (
              <div className="divide-y">
                {filteredSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="grid grid-cols-12 items-center p-2 hover:bg-muted/50"
                  >
                    <div className="col-span-3 font-medium text-sm truncate">
                      {session.id}
                    </div>
                    <div className="col-span-4 text-sm truncate">
                      {session.supi}
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={`${getStatusBadgeColor(session.status)}`}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      {format(new Date(session.createdAt), 'MMM d, HH:mm')}
                    </div>
                    <div className="col-span-1 flex space-x-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setSelectedSession(session)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Terminate Session</DropdownMenuItem>
                          <DropdownMenuItem>Modify QoS</DropdownMenuItem>
                          <DropdownMenuItem>Generate Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CustomCard>

      {/* Session Details Dialog */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected PCF session.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Session {selectedSession.id}</h3>
                  <p className="text-sm text-gray-500">{selectedSession.supi}</p>
                </div>
                <Badge variant="outline" className={`${getStatusBadgeColor(selectedSession.status)}`}>
                  {selectedSession.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Session Creation Time</div>
                  <div className="text-sm bg-muted p-2 rounded">
                    {format(new Date(selectedSession.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Last Updated</div>
                  <div className="text-sm bg-muted p-2 rounded">
                    {format(new Date(selectedSession.updatedAt), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                </div>
              </div>
              
              {selectedSession.qosParameters && (
                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center">
                    <Info className="w-4 h-4 mr-2 text-5g-pcf" />
                    QoS Parameters
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm bg-muted p-2 rounded">
                      <div className="font-medium">QoS Index</div>
                      <div>{selectedSession.qosParameters.qosIndex}</div>
                    </div>
                    {selectedSession.qosParameters.guaranteedBitRate && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <div className="font-medium">GBR (kbps)</div>
                        <div>{selectedSession.qosParameters.guaranteedBitRate}</div>
                      </div>
                    )}
                    {selectedSession.qosParameters.maximumBitRate && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <div className="font-medium">MBR (kbps)</div>
                        <div>{selectedSession.qosParameters.maximumBitRate}</div>
                      </div>
                    )}
                    {selectedSession.qosParameters.packetDelayBudget && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <div className="font-medium">Delay Budget (ms)</div>
                        <div>{selectedSession.qosParameters.packetDelayBudget}</div>
                      </div>
                    )}
                    {selectedSession.qosParameters.packetErrorRate && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <div className="font-medium">Packet Error Rate</div>
                        <div>{selectedSession.qosParameters.packetErrorRate}</div>
                      </div>
                    )}
                    {selectedSession.qosParameters.priority && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <div className="font-medium">Priority</div>
                        <div>{selectedSession.qosParameters.priority}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Applied Policy Rules</div>
                <div className="text-sm bg-muted p-2 rounded">
                  {selectedSession.policyRules.length > 0 ? (
                    <div className="space-y-1">
                      {selectedSession.policyRules.map(policyId => (
                        <div key={policyId} className="p-1 bg-white rounded border text-xs flex justify-between">
                          <span>{policyId}</span>
                          <Button variant="ghost" size="sm" className="h-5 px-1 py-0 text-5g-pcf">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No policy rules applied</div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Related Network Functions</div>
                <div className="text-sm bg-muted p-2 rounded">
                  {selectedSession.relatedNetworkFunctions.length > 0 ? (
                    <div className="space-y-1">
                      {selectedSession.relatedNetworkFunctions.map(nf => (
                        <div key={nf.id} className="p-1 bg-white rounded border text-xs flex justify-between">
                          <span>{nf.type}: {nf.id}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No related network functions</div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSession(null)}>
                Close
              </Button>
              <Button className="bg-5g-pcf hover:bg-5g-pcf/90">
                Modify QoS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SessionMonitor;
