
import { NpcfSmPolicyCreateRequest, SmPolicyDecision, PccRule, PolicyControlRequestTrigger } from "./smPolicyTypes";
import { createQosDecisions } from "./qosDecisions";
import { createChargingDecisions } from "./chargingDecisions";
import { createTrafficControlDecisions } from "./trafficControlDecisions";
import { getRevalidationTime } from "./policyUtils";

/**
 * Create a policy decision based on the request context and subscription data
 */
export function createPolicyDecision(
  request: NpcfSmPolicyCreateRequest, 
  policyId: string,
  subscriptionData?: Record<string, any>
): SmPolicyDecision {
  const { smPolicyContextData } = request;
  
  // Default session rule
  const sessionRules = {
    "sess-rule-1": {
      authSessAmbr: {
        uplink: "100 Mbps",
        downlink: "500 Mbps"
      },
      authDefQos: {
        qosId: 1,
        arp: {
          priorityLevel: 1,
          preemptCap: "NOT_PREEMPT" as "NOT_PREEMPT", // Type assertion to match the enum
          preemptVuln: "NOT_PREEMPTABLE" as "NOT_PREEMPTABLE" // Type assertion to match the enum
        },
        qnc: false,
        priorityLevel: 10,
        averWindow: 2000,
        maxDataBurstVol: 4000
      },
      sessRuleId: "sess-rule-1"
    }
  };
  
  // Apply subscription-specific QoS if available from UDR
  if (subscriptionData?.policyData?.smPolicyData?.smPolicySnssaiData) {
    // Extract slice identifiers from request
    const sst = smPolicyContextData.sliceInfo?.sst || 1;
    const sd = smPolicyContextData.sliceInfo?.sd || "000001";
    const dnn = smPolicyContextData.dnn;
    
    // Try to find matching policy data in subscription
    const sliceKey = `${sst}-${sd}`;
    const sliceData = subscriptionData.policyData.smPolicyData.smPolicySnssaiData[sliceKey];
    
    if (sliceData?.smPolicyDnnData?.[dnn]) {
      const dnnPolicy = sliceData.smPolicyDnnData[dnn];
      
      // Apply subscription AMBR if available
      if (dnnPolicy.maxBrUl && dnnPolicy.maxBrDl) {
        sessionRules["sess-rule-1"].authSessAmbr = {
          uplink: dnnPolicy.maxBrUl,
          downlink: dnnPolicy.maxBrDl
        };
        
        console.log(`Applied subscription AMBR from UDR: UL=${dnnPolicy.maxBrUl}, DL=${dnnPolicy.maxBrDl}`);
      }
    }
  }
  
  // PCC Rules - Different rules based on DNN and subscription data
  const pccRules: Record<string, PccRule> = {};
  
  // Apply DNN-specific policies
  if (smPolicyContextData.dnn === "internet") {
    pccRules["pcc-rule-internet"] = {
      pccRuleId: "pcc-rule-internet",
      flowInfos: [
        {
          flowDescription: "permit out ip from any to any"
        }
      ],
      precedence: 1000,
      refQosData: ["qos-internet"],
      refChgData: ["chg-internet"]
    };
  } else if (smPolicyContextData.dnn.includes("ims")) {
    pccRules["pcc-rule-ims"] = {
      pccRuleId: "pcc-rule-ims",
      appId: "ims-signaling",
      precedence: 100,
      refQosData: ["qos-ims"],
      refChgData: ["chg-ims"]
    };
  } else if (smPolicyContextData.dnn.includes("mms")) {
    pccRules["pcc-rule-mms"] = {
      pccRuleId: "pcc-rule-mms",
      appId: "mms",
      precedence: 500,
      refQosData: ["qos-mms"],
      refChgData: ["chg-mms"]
    };
  }
  
  // Add subscription category specific rules if available from UDR
  const subscriberCategories = 
    subscriptionData?.policyData?.uePolicy?.subscCats || 
    subscriptionData?.policyData?.smPolicyData?.smPolicySnssaiData?.[`${smPolicyContextData.sliceInfo?.sst || 1}-${smPolicyContextData.sliceInfo?.sd || "000001"}`]?.smPolicyDnnData?.[smPolicyContextData.dnn]?.subscCats || 
    [];
  
  if (subscriberCategories.includes("premium")) {
    pccRules["pcc-rule-premium"] = {
      pccRuleId: "pcc-rule-premium",
      appId: "premium-services",
      precedence: 50,
      refQosData: ["qos-premium"],
      refChgData: ["chg-premium"]
    };
    
    console.log("Applied premium subscriber policy from UDR data");
  }
  
  if (subscriberCategories.includes("streaming")) {
    pccRules["pcc-rule-streaming"] = {
      pccRuleId: "pcc-rule-streaming",
      appId: "video-streaming",
      precedence: 200,
      refQosData: ["qos-streaming"],
      refChgData: ["chg-streaming"],
      refTcData: ["tc-streaming"]
    };
    
    console.log("Applied streaming subscriber policy from UDR data");
  }
  
  // Get QoS, Charging, and Traffic Control decisions
  const qosDecs = createQosDecisions(pccRules, subscriberCategories);
  const chgDecs = createChargingDecisions(pccRules, subscriberCategories);
  const traffContDecs = createTrafficControlDecisions(pccRules);
  
  // Create policy triggers based on subscription data
  const policyCtrlReqTriggers: PolicyControlRequestTrigger[] = [
    PolicyControlRequestTrigger.PLMN_CH,
    PolicyControlRequestTrigger.RAT_TY_CH,
    PolicyControlRequestTrigger.UE_IP_CH
  ];
  
  // Add QoS monitoring triggers for IMS
  if (smPolicyContextData.dnn.includes("ims")) {
    policyCtrlReqTriggers.push(PolicyControlRequestTrigger.QOS_MONITORING);
    policyCtrlReqTriggers.push(PolicyControlRequestTrigger.QOS_NOTIF);
  }
  
  // Construct the complete policy decision
  return {
    id: policyId,
    sessionRules,
    pccRules,
    qosDecs,
    chgDecs,
    traffContDecs,
    policyCtrlReqTriggers,
    revalidationTime: getRevalidationTime(),
    online: true,
    offline: true,
    udrInfo: {
      accessed: !!subscriptionData,
      dataApplied: !!subscriptionData
    }
  };
}
