
import { PccRule, TrafficControlDecision } from "./smPolicyTypes";

/**
 * Create traffic control decisions based on the PCC rules
 */
export function createTrafficControlDecisions(
  pccRules: Record<string, PccRule>
): Record<string, TrafficControlDecision> {
  const traffContDecs: Record<string, TrafficControlDecision> = {};
  
  if (pccRules["pcc-rule-streaming"]) {
    traffContDecs["tc-streaming"] = {
      tcId: "tc-streaming",
      flowStatus: "ENABLED",
      trafficSteeringPolIdDl: "video-steering-policy"
    };
  }
  
  return traffContDecs;
}
