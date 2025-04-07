
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import CustomCard from "@/components/ui/CustomCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NpcfSmPolicyCreateRequest, NpcfSmPolicyResponse, RatType, QosFlowUsage } from "@/utils/smPolicyTypes";
import { processSmPolicyCreate } from "@/utils/smPolicyApi";
import { Activity, Code, PlayCircle, Bug, Copy } from "lucide-react";
import { runSmPolicyTests } from "@/utils/smPolicyApiTest";

const SmPolicyApiDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NpcfSmPolicyResponse | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      requestJson: JSON.stringify({
        smPolicyContextData: {
          supi: "imsi-123456789012345",
          pduSessionId: 1,
          pduSessionType: "IPv4",
          dnn: "internet",
          notificationUri: "https://smf.example.com/callback",
          sliceInfo: { sst: 1, sd: "000001" },
          servingNetwork: { mcc: "234", mnc: "015" },
          ratType: RatType.NR
        }
      }, null, 2)
    }
  });
  
  const onSubmit = async (data: { requestJson: string }) => {
    setLoading(true);
    setJsonError(null);
    
    try {
      const requestObj = JSON.parse(data.requestJson) as NpcfSmPolicyCreateRequest;
      console.log("Processing request:", requestObj);
      
      const response = await processSmPolicyCreate(requestObj);
      setResult(response);
      
      if (response.status === "SUCCESS") {
        toast({
          title: "SM Policy Created",
          description: `Policy ID: ${response.data?.id}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: response.error?.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof SyntaxError) {
        setJsonError("Invalid JSON. Please check your request format.");
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "The request contains invalid JSON syntax.",
        });
      } else {
        setJsonError(String(error));
        toast({
          variant: "destructive",
          title: "Error",
          description: String(error),
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const runTests = async () => {
    setLoading(true);
    try {
      await runSmPolicyTests();
      toast({
        title: "Tests Completed",
        description: "Check the console for detailed results",
      });
    } catch (error) {
      console.error("Test error:", error);
      toast({
        variant: "destructive",
        title: "Test Error",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast({
        title: "Copied to clipboard",
      });
    }
  };
  
  const loadExampleRequest = (type: "internet" | "ims" | "minimal") => {
    let example: NpcfSmPolicyCreateRequest;
    
    switch (type) {
      case "internet":
        example = {
          smPolicyContextData: {
            supi: "imsi-123456789012345",
            pduSessionId: 1,
            pduSessionType: "IPv4",
            dnn: "internet",
            notificationUri: "https://smf.example.com/callback",
            sliceInfo: { sst: 1, sd: "000001" },
            servingNetwork: { mcc: "234", mnc: "015" },
            ratType: RatType.NR,
            ipv4Address: "10.0.0.1"
          }
        };
        break;
      case "ims":
        example = {
          smPolicyContextData: {
            supi: "imsi-123456789012345",
            pduSessionId: 2,
            pduSessionType: "IPv4v6",
            dnn: "ims",
            notificationUri: "https://smf.example.com/callback",
            sliceInfo: { sst: 1, sd: "000001" },
            servingNetwork: { mcc: "234", mnc: "015" },
            ratType: RatType.NR,
            qosFlowUsage: QosFlowUsage.IMS_SIG
          }
        };
        break;
      case "minimal":
        example = {
          smPolicyContextData: {
            supi: "imsi-123456789012345",
            pduSessionId: 3,
            pduSessionType: "IPv4",
            dnn: "internet",
            notificationUri: "https://smf.example.com/callback"
          }
        };
        break;
    }
    
    setValue("requestJson", JSON.stringify(example, null, 2));
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Npcf_SMPolicy API Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomCard
          title="SM Policy Create Request"
          description="Send a JSON request to create an SM Policy"
        >
          <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => loadExampleRequest("internet")}>
                Internet Example
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadExampleRequest("ims")}>
                IMS Example
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadExampleRequest("minimal")}>
                Minimal Example
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Textarea
                  {...register("requestJson")}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="Enter your JSON request here"
                />
                
                {jsonError && (
                  <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                    {jsonError}
                  </div>
                )}
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={runTests}
                    disabled={loading}
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Run Test Cases
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="bg-5g-pcf hover:bg-5g-pcf/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Activity className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </CustomCard>
        
        <CustomCard
          title="SM Policy Response"
          description="Response from the PCF"
          headerExtra={
            result && (
              <Badge className={result.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {result.status}
              </Badge>
            )
          }
        >
          <div className="relative">
            <div className="absolute top-2 right-2">
              {result && (
                <Button variant="ghost" size="sm" onClick={copyResult}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="bg-muted p-4 rounded-md h-[400px] overflow-auto font-mono text-sm">
              {result ? (
                <pre>{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Code className="h-8 w-8 mb-2" />
                  <p>Submit a request to see the response</p>
                </div>
              )}
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default SmPolicyApiDemo;
