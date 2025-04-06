
import React, { useState } from "react";
import { PolicyRule, PolicyType } from "@/utils/pcfTypes";
import CustomCard from "@/components/ui/CustomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Sliders, Tag, Edit, Trash, FileText, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface PolicyRulesProps {
  policies: PolicyRule[];
}

const PolicyRules: React.FC<PolicyRulesProps> = ({ policies }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRule | null>(null);
  const [tabValue, setTabValue] = useState("all");

  // Filter policies based on search query and tab value
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = tabValue === "all" || 
                       (tabValue === "active" && policy.status === "active") ||
                       (tabValue === "inactive" && policy.status === "inactive") ||
                       (tabValue === "draft" && policy.status === "draft");
    
    return matchesSearch && matchesTab;
  });

  // Get badge color based on policy type
  const getTypeBadgeColor = (type: PolicyType) => {
    switch (type) {
      case PolicyType.AM: return "bg-blue-100 text-blue-800";
      case PolicyType.SM: return "bg-green-100 text-green-800";
      case PolicyType.UE: return "bg-purple-100 text-purple-800";
      case PolicyType.QoS: return "bg-amber-100 text-amber-800";
      case PolicyType.URSP: return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "draft": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <CustomCard 
        title="Policy Rules" 
        description="Manage PCF policy rules"
        headerExtra={
          <Button size="sm" className="bg-5g-pcf hover:bg-5g-pcf/90">
            <Plus className="mr-1 h-4 w-4" /> New Policy
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search policies..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center">
              <Sliders className="mr-1 h-4 w-4" /> Filter
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" value={tabValue} onValueChange={setTabValue}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Policy list */}
          <div className="rounded-md border">
            <div className="bg-muted/50 p-2 grid grid-cols-12 text-xs font-medium text-muted-foreground">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Last Updated</div>
              <div className="col-span-1">Actions</div>
            </div>
            {filteredPolicies.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No policies found.
              </div>
            ) : (
              <div className="divide-y">
                {filteredPolicies.map((policy) => (
                  <div 
                    key={policy.id} 
                    className="grid grid-cols-12 items-center p-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="col-span-4 font-medium truncate" title={policy.name}>
                      {policy.name}
                    </div>
                    <div className="col-span-3">
                      <Badge variant="outline" className={`${getTypeBadgeColor(policy.type)}`}>
                        {policy.type}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={`${getStatusBadgeColor(policy.status)}`}>
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      {format(new Date(policy.updatedAt), 'MMM d, yyyy')}
                    </div>
                    <div className="col-span-1 flex space-x-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CustomCard>

      {/* Policy Details Dialog */}
      {selectedPolicy && (
        <Dialog open={!!selectedPolicy} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Policy Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected policy rule.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedPolicy.name}</h3>
                  <p className="text-sm text-gray-500">{selectedPolicy.description}</p>
                </div>
                <Badge variant="outline" className={`${getStatusBadgeColor(selectedPolicy.status)}`}>
                  {selectedPolicy.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-5g-pcf" />
                    Type
                  </div>
                  <div className="text-sm bg-muted p-2 rounded">
                    {selectedPolicy.type}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center">
                    <Sliders className="w-4 h-4 mr-2 text-5g-pcf" />
                    Precedence
                  </div>
                  <div className="text-sm bg-muted p-2 rounded">
                    {selectedPolicy.precedence}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-5g-pcf" />
                  Conditions
                </div>
                <div className="text-sm bg-muted p-2 rounded space-y-2">
                  {selectedPolicy.conditions.map(condition => (
                    <div key={condition.id} className="p-2 bg-white rounded border">
                      <div className="font-medium capitalize">{condition.type}</div>
                      <div className="text-xs text-gray-500">
                        {Object.entries(condition.parameters).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {" "}
                            {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-5g-pcf" />
                  Actions
                </div>
                <div className="text-sm bg-muted p-2 rounded space-y-2">
                  {selectedPolicy.actions.map(action => (
                    <div key={action.id} className="p-2 bg-white rounded border">
                      <div className="font-medium capitalize">{action.type}</div>
                      <div className="text-xs text-gray-500">
                        {Object.entries(action.parameters).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {" "}
                            {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Created: {format(new Date(selectedPolicy.createdAt), 'MMM d, yyyy HH:mm:ss')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last Updated: {format(new Date(selectedPolicy.updatedAt), 'MMM d, yyyy HH:mm:ss')}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPolicy(null)}>
                Close
              </Button>
              <Button className="bg-5g-pcf hover:bg-5g-pcf/90">
                <Edit className="mr-1 h-4 w-4" /> Edit Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PolicyRules;
