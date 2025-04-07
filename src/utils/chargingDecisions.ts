
import { PccRule, ChargingDecision } from "./smPolicyTypes";

/**
 * Create charging decisions based on the PCC rules and subscriber categories
 */
export function createChargingDecisions(
  pccRules: Record<string, PccRule>,
  subscriberCategories: string[]
): Record<string, ChargingDecision> {
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
  
  if (pccRules["pcc-rule-premium"]) {
    chgDecs["chg-premium"] = {
      chgId: "chg-premium",
      offline: true,
      online: true,
      ratingGroup: 900,
      serviceId: 9
    };
  }
  
  if (pccRules["pcc-rule-streaming"]) {
    chgDecs["chg-streaming"] = {
      chgId: "chg-streaming",
      offline: true,
      online: true,
      ratingGroup: 400,
      serviceId: 4
    };
  }
  
  return chgDecs;
}
