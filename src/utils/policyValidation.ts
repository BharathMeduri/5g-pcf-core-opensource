
import { NpcfSmPolicyCreateRequest } from "./smPolicyTypes";

/**
 * Validate the incoming SM Policy Create request
 */
export function validateSmPolicyRequest(request: NpcfSmPolicyCreateRequest): void {
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
