
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import CustomCard from "@/components/ui/CustomCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  NpcfSmPolicyCreateRequest, 
  NpcfSmPolicyOperation, 
  NpcfSmPolicyResponse,
  mockSmPolicyCreateResponse,
  mockSmPolicyContextData,
  RatType,
  QosFlowUsage,
  PolicyControlRequestTrigger,
} from "@/utils/smPolicyTypes";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  LayoutGrid, 
  List,
  Server, 
  Settings,
  Wifi,
  Smartphone,
  Network, 
  RefreshCw,
  Send,
  Save,
  Copy,
  CheckCircle,
  XCircle
} from "lucide-react";

// Define schema for the form
const createPolicyFormSchema = z.object({
  supi: z.string().min(10, "SUPI must be at least 10 characters"),
  pduSessionId: z.coerce.number().int().min(1).max(255),
  pduSessionType: z.enum(["IPv4", "IPv6", "IPv4v6", "Ethernet", "Unstructured"]),
  dnn: z.string().min(1, "DNN is required"),
  notificationUri: z.string().url("Must be a valid URL"),
  sstValue: z.coerce.number().int().min(0).max(255),
  sdValue: z.string().optional(),
  mcc: z.string().regex(/^\d{3}$/, "MCC must be 3 digits"),
  mnc: z.string().regex(/^\d{2,3}$/, "MNC must be 2-3 digits"),
  ratType: z.nativeEnum(RatType),
  ipv4Address: z.string().optional(),
  ipv6AddressPrefix: z.string().optional(),
  gpsi: z.string().optional(),
  suppFeat: z.string().optional(),
  refQosIndication: z.boolean().default(false),
  qosFlowUsage: z.nativeEnum(QosFlowUsage).optional(),
});

type CreatePolicyFormValues = z.infer<typeof createPolicyFormSchema>;

const SmPolicyControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  const [apiResponse, setApiResponse] = useState<NpcfSmPolicyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize form with default values
  const form = useForm<CreatePolicyFormValues>({
    resolver: zodResolver(createPolicyFormSchema),
    defaultValues: {
      supi: mockSmPolicyContextData.supi,
      pduSessionId: mockSmPolicyContextData.pduSessionId,
      pduSessionType: mockSmPolicyContextData.pduSessionType,
      dnn: mockSmPolicyContextData.dnn,
      notificationUri: mockSmPolicyContextData.notificationUri,
      sstValue: mockSmPolicyContextData.sliceInfo?.sst || 1,
      sdValue: mockSmPolicyContextData.sliceInfo?.sd || "000001",
      mcc: mockSmPolicyContextData.servingNetwork?.mcc || "234",
      mnc: mockSmPolicyContextData.servingNetwork?.mnc || "015",
      ratType: mockSmPolicyContextData.ratType || RatType.NR,
      ipv4Address: mockSmPolicyContextData.ipv4Address || "",
      gpsi: mockSmPolicyContextData.gpsi || "",
      suppFeat: mockSmPolicyContextData.suppFeat || "",
      refQosIndication: mockSmPolicyContextData.refQosIndication || false,
      qosFlowUsage: mockSmPolicyContextData.qosFlowUsage || QosFlowUsage.GENERAL,
    },
  });

  // Handle form submission
  const onSubmit = async (values: CreatePolicyFormValues) => {
    setLoading(true);
    
    try {
      // Construct request payload
      const payload: NpcfSmPolicyCreateRequest = {
        smPolicyContextData: {
          supi: values.supi,
          pduSessionId: values.pduSessionId,
          pduSessionType: values.pduSessionType,
          dnn: values.dnn,
          notificationUri: values.notificationUri,
          sliceInfo: {
            sst: values.sstValue,
            sd: values.sdValue
          },
          servingNetwork: {
            mcc: values.mcc,
            mnc: values.mnc
          },
          ratType: values.ratType,
          ipv4Address: values.ipv4Address || undefined,
          ipv6AddressPrefix: values.ipv6AddressPrefix || undefined,
          gpsi: values.gpsi || undefined,
          suppFeat: values.suppFeat || undefined,
          refQosIndication: values.refQosIndication,
          qosFlowUsage: values.qosFlowUsage,
          ueTimeZone: mockSmPolicyContextData.ueTimeZone, // Using default values for these
          chargingCharacteristics: mockSmPolicyContextData.chargingCharacteristics,
          chfInfo: mockSmPolicyContextData.chfInfo
        }
      };

      console.log("Sending SM Policy Create Request:", payload);
      
      // In a real implementation, this would be an API call
      // For now, we're using a mock response
      setTimeout(() => {
        setApiResponse(mockSmPolicyCreateResponse);
        setLoading(false);
        toast({
          title: "SM Policy Created",
          description: "Policy decision successfully created for PDU Session",
        });
      }, 1000);
    } catch (error) {
      console.error("Error creating SM Policy:", error);
      setLoading(false);
      setApiResponse({
        status: "FAILURE",
        error: {
          code: "500",
          message: "Failed to create SM Policy",
          details: String(error)
        }
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create SM Policy",
      });
    }
  };

  const handleCopyResponse = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
      toast({
        title: "Copied to clipboard",
        description: "Response JSON copied to clipboard",
      });
    }
  };

  return (
    <CustomCard 
      title="Npcf_SMPolicy Service" 
      description="Policy Control Function (PCF) to Session Management Function (SMF) interface for PDU Session"
      headerExtra={
        <Badge className="bg-5g-pcf text-white">3GPP Release 16</Badge>
      }
    >
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="create" className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            <span>Create</span>
          </TabsTrigger>
          <TabsTrigger value="update" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span>Update</span>
          </TabsTrigger>
          <TabsTrigger value="delete" className="flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            <span>Delete</span>
          </TabsTrigger>
          <TabsTrigger value="api-docs" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            <span>API Docs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1 md:col-span-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <Accordion type="single" collapsible defaultValue="ue-info" className="w-full mb-4">
                    <AccordionItem value="ue-info">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center text-sm font-medium">
                          <Smartphone className="h-4 w-4 mr-2" />
                          UE & PDU Session Information
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="supi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SUPI</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., imsi-123456789012345" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gpsi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GPSI (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., msisdn-447700900000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pduSessionId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PDU Session ID</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" max="255" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pduSessionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PDU Session Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select session type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="IPv4">IPv4</SelectItem>
                                    <SelectItem value="IPv6">IPv6</SelectItem>
                                    <SelectItem value="IPv4v6">IPv4v6</SelectItem>
                                    <SelectItem value="Ethernet">Ethernet</SelectItem>
                                    <SelectItem value="Unstructured">Unstructured</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="network-info">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center text-sm font-medium">
                          <Network className="h-4 w-4 mr-2" />
                          Network Information
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="dnn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>DNN (Data Network Name)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., internet" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ratType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RAT Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select RAT type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.values(RatType).map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name="mcc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>MCC</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 234" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="mnc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>MNC</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 015" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="ipv4Address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IPv4 Address (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 10.0.0.1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="slice-info">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center text-sm font-medium">
                          <LayoutGrid className="h-4 w-4 mr-2" />
                          Network Slice Information
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="sstValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slice Type (SST)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" max="255" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="sdValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slice Differentiator (SD) (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 000001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="additional-params">
                      <AccordionTrigger className="py-2">
                        <div className="flex items-center text-sm font-medium">
                          <Settings className="h-4 w-4 mr-2" />
                          Additional Parameters
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="notificationUri"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notification URI</FormLabel>
                                <FormControl>
                                  <Input placeholder="SMF callback URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="suppFeat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Supported Features (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bitmap of supported features" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="qosFlowUsage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>QoS Flow Usage</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select QoS flow usage" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.values(QosFlowUsage).map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="refQosIndication"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Reflective QoS Indication</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" type="button" onClick={() => form.reset()}>
                      Reset
                    </Button>
                    <Button type="submit" className="bg-5g-pcf hover:bg-5g-pcf/90" disabled={loading}>
                      {loading ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Create SM Policy
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            <div className="col-span-1 md:col-span-2">
              <div className="border rounded-md p-4 h-full bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">API Response</h3>
                  {apiResponse && (
                    <Button variant="ghost" size="sm" onClick={handleCopyResponse}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="bg-muted p-4 rounded-md h-[500px] overflow-auto">
                  {apiResponse ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <Badge className={apiResponse.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {apiResponse.status === "SUCCESS" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {apiResponse.status}
                        </Badge>
                      </div>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                      <Activity className="h-8 w-8 mb-2 text-muted-foreground/50" />
                      <p>Submit the form to see the API response</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="update">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <RefreshCw className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">SM Policy Update</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              This feature allows updating an existing SM policy context
            </p>
            <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "This feature is under development" })}>
              Coming Soon
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="delete">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <XCircle className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">SM Policy Termination</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              This feature allows terminating an existing SM policy context
            </p>
            <Button variant="outline" onClick={() => toast({ title: "Coming Soon", description: "This feature is under development" })}>
              Coming Soon
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="api-docs">
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Npcf_SMPolicy API Documentation</h3>
              <p className="text-muted-foreground mb-4">
                This service enables a NF to retrieve and influence SM related policies for a UE in the 5G System.
              </p>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Create SM Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">POST /sm-policies</p>
                  <p className="text-sm">
                    Creates a new Individual SM Policy resource for an SM context.
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Update SM Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">POST /sm-policies/{"{smPolicyId}"}/update</p>
                  <p className="text-sm">
                    Updates an existing Individual SM Policy resource.
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Delete SM Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">DELETE /sm-policies/{"{smPolicyId}"}</p>
                  <p className="text-sm">
                    Deletes an existing Individual SM Policy resource.
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded-md">
                  <h4 className="font-medium mb-1">Get SM Policy</h4>
                  <p className="text-sm text-muted-foreground mb-2">GET /sm-policies/{"{smPolicyId}"}</p>
                  <p className="text-sm">
                    Retrieves an existing Individual SM Policy resource.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CustomCard>
  );
};

export default SmPolicyControl;
