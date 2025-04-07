
import { PccRule, QosDecision } from "./smPolicyTypes";

/**
 * Create QoS decisions based on the PCC rules and subscriber categories
 */
export function createQosDecisions(
  pccRules: Record<string, PccRule>,
  subscriberCategories: string[]
): Record<string, QosDecision> {
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
  
  if (pccRules["pcc-rule-premium"]) {
    qosDecs["qos-premium"] = {
      qosId: "qos-premium",
      qosParams: {
        qos5qi: 7,
        maxbrUl: "100 Mbps",
        maxbrDl: "500 Mbps",
        gbrUl: "20 Mbps",
        gbrDl: "50 Mbps",
        arp: {
          priorityLevel: 1,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "NOT_PREEMPTABLE"
        }
      }
    };
  }
  
  if (pccRules["pcc-rule-streaming"]) {
    qosDecs["qos-streaming"] = {
      qosId: "qos-streaming",
      qosParams: {
        qos5qi: 2,
        maxbrUl: "5 Mbps",
        maxbrDl: "50 Mbps",
        gbrUl: "2 Mbps",
        gbrDl: "25 Mbps",
        arp: {
          priorityLevel: 4,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "PREEMPTABLE"
        }
      }
    };
  }
  
  return qosDecs;
}
