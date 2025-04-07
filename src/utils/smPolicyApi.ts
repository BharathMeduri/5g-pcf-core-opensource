
import { 
  NpcfSmPolicyCreateRequest, 
  NpcfSmPolicyResponse,
  SmPolicyDecision,
  PccRule,
  QosDecision,
  ChargingDecision,
  TrafficControlDecision,
  UsageMonitoringDecision,
  PolicyControlRequestTrigger 
} from "./smPolicyTypes";

/**
 * Process Npcf_SMPolicy Create request from SMF
 * Based on 3GPP TS 29.512 - 5G System; Session Management Policy Control Service
 * 
 * @param request The SM Policy Context creation request from SMF
 * @returns Policy decision response with PCC rules, QoS decisions, etc.
 */
export async function processSmPolicyCreate(
  request: NpcfSmPolicyCreateRequest
): Promise<NpcfSmPolicyResponse> {
  console.log("Processing SM Policy Create request:", request);
  
  try {
    // 1. Validate the incoming request
    validateSmPolicyRequest(request);
    
    // 2. Generate a unique policy ID
    const policyId = generatePolicyId();
    
    // 3. Apply policy rules based on the context data
    const policyDecision = createPolicyDecision(request, policyId);
    
    // 4. Log policy decision for audit
    console.log("SM Policy Decision created:", policyDecision);
    
    // 5. Return the policy decision response
    return {
      status: "SUCCESS",
      data: policyDecision
    };
  } catch (error) {
    console.error("Error processing SM Policy Create request:", error);
    return {
      status: "FAILURE",
      error: {
        code: "PCF_SM_ERROR",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: String(error)
      }
    };
  }
}

/**
 * Validate the incoming SM Policy Create request
 */
function validateSmPolicyRequest(request: NpcfSmPolicyCreateRequest): void {
  const { smPolicyContextData } = request;
  
  if (!smPolicyContextData) {
    throw new Error("Missing SM Policy Context Data");
  }
  
  // Required fields according to 3GPP spec
  if (!smPolicyContextData.supi) {
    throw new Error("Missing SUPI in the request");
  }
  
  if (!smPolicyContextData.pduSessionId) {
    throw new Error("Missing PDU Session ID in the request");
  }
  
  if (!smPolicyContextData.pduSessionType) {
    throw new Error("Missing PDU Session Type in the request");
  }
  
  if (!smPolicyContextData.dnn) {
    throw new Error("Missing DNN in the request");
  }
  
  if (!smPolicyContextData.notificationUri) {
    throw new Error("Missing Notification URI in the request");
  }
  
  // Validate PDU Session ID range (1-255)
  if (smPolicyContextData.pduSessionId < 1 || smPolicyContextData.pduSessionId > 255) {
    throw new Error("PDU Session ID must be between 1 and 255");
  }
}

/**
 * Generate a unique policy ID using timestamp and random number
 */
function generatePolicyId(): string {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000);
  return `sm-policy-${timestamp}-${randomPart}`;
}

/**
 * Create a policy decision based on the request context
 */
function createPolicyDecision(request: NpcfSmPolicyCreateRequest, policyId: string): SmPolicyDecision {
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
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "NOT_PREEMPTABLE"
        },
        qnc: false,
        priorityLevel: 10,
        averWindow: 2000,
        maxDataBurstVol: 4000
      },
      sessRuleId: "sess-rule-1"
    }
  };
  
  // PCC Rules - Different rules based on DNN
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
  
  // QoS Decisions based on the selected PCC rules
  const qosDecs: Record<string, QosDecision> = {};
  
  if (pccRules["pcc-rule-internet"]) {
    qosDecs["qos-internet"] = {
      qosId: "qos-internet",
      qosParams: {
        qos5qi: 9,
        maxbrUl: "50 Mbps",
        maxbrDl: "200 Mbps",
        arp: {
          priorityLevel: 8,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "PREEMPTABLE"
        }
      }
    };
  }
  
  if (pccRules["pcc-rule-ims"]) {
    qosDecs["qos-ims"] = {
      qosId: "qos-ims",
      qosParams: {
        qos5qi: 5,
        maxbrUl: "2 Mbps",
        maxbrDl: "2 Mbps",
        gbrUl: "500 kbps",
        gbrDl: "500 kbps",
        arp: {
          priorityLevel: 1,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "NOT_PREEMPTABLE"
        }
      }
    };
  }
  
  if (pccRules["pcc-rule-mms"]) {
    qosDecs["qos-mms"] = {
      qosId: "qos-mms",
      qosParams: {
        qos5qi: 6,
        maxbrUl: "10 Mbps",
        maxbrDl: "10 Mbps",
        arp: {
          priorityLevel: 6,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "PREEMPTABLE"
        }
      }
    };
  }
  
  // Charging decisions based on the selected PCC rules
  const chgDecs: Record<string, ChargingDecision> = {};
  
  if (pccRules["pcc-rule-internet"]) {
    chgDecs["chg-internet"] = {
      chgId: "chg-internet",
      offline: true,
      online: true,
      ratingGroup: 100,
      reportingLevel: "SERVICE_IDENTIFIER_LEVEL",
      serviceId: 1
    };
  }
  
  if (pccRules["pcc-rule-ims"]) {
    chgDecs["chg-ims"] = {
      chgId: "chg-ims",
      offline: true,
      online: false,
      ratingGroup: 200,
      serviceId: 2
    };
  }
  
  if (pccRules["pcc-rule-mms"]) {
    chgDecs["chg-mms"] = {
      chgId: "chg-mms",
      offline: true,
      online: true,
      ratingGroup: 300,
      serviceId: 3
    };
  }
  
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
    policyCtrlReqTriggers,
    revalidationTime: getRevalidationTime(),
    online: Object.values(chgDecs).some(chg => chg.online),
    offline: Object.values(chgDecs).some(chg => chg.offline)
  };
}

/**
 * Calculate a revalidation time (24 hours from now)
 */
function getRevalidationTime(): string {
  const revalidationDate = new Date();
  revalidationDate.setHours(revalidationDate.getHours() + 24);
  return revalidationDate.toISOString();
}

/**
 * Update an existing policy based on triggers
 * (This would be used by the policy update API)
 */
export function updatePolicyBasedOnTrigger(
  policyId: string, 
  triggers: PolicyControlRequestTrigger[]
): void {
  console.log(`Updating policy ${policyId} based on triggers:`, triggers);
  // Implementation would go here in a real system
}

/**
 * Terminate an existing policy
 * (This would be used by the policy delete API)
 */
export function terminatePolicy(policyId: string): void {
  console.log(`Terminating policy ${policyId}`);
  // Implementation would go here in a real system
}
