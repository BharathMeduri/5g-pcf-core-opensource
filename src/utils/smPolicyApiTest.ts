
import { 
  NpcfSmPolicyCreateRequest,
  SmPolicyContextData,
  RatType,
  QosFlowUsage
} from "./smPolicyTypes";
import { processSmPolicyCreate } from "./smPolicyApi";

/**
 * Test utility for the SM Policy API
 * This can be used in a development environment to test different scenarios
 */
export async function runSmPolicyTests() {
  console.group("SM Policy API Tests");
  
  try {
    // Test 1: Valid Internet PDU Session
    console.log("Test 1: Valid Internet PDU Session");
    const internetSession = createTestRequest({
      dnn: "internet",
      pduSessionType: "IPv4",
      ratType: RatType.NR
    });
    const internetResult = await processSmPolicyCreate(internetSession);
    console.log("Result:", internetResult);
    
    // Test 2: Valid IMS PDU Session
    console.log("Test 2: Valid IMS PDU Session");
    const imsSession = createTestRequest({
      dnn: "ims",
      pduSessionType: "IPv4v6",
      ratType: RatType.NR
    });
    const imsResult = await processSmPolicyCreate(imsSession);
    console.log("Result:", imsResult);
    
    // Test 3: Missing required fields
    console.log("Test 3: Missing required fields");
    try {
      const invalidSession = {
        smPolicyContextData: {
          // Missing most required fields
          supi: "imsi-123456789012345"
        } as SmPolicyContextData
      };
      await processSmPolicyCreate(invalidSession);
    } catch (e) {
      console.log("Error caught as expected:", e);
    }
    
    // Test 4: Invalid PDU Session ID
    console.log("Test 4: Invalid PDU Session ID");
    const invalidPduSessionId = createTestRequest({
      pduSessionId: 300 // Invalid - should be between 1-255
    });
    const invalidPduSessionIdResult = await processSmPolicyCreate(invalidPduSessionId);
    console.log("Result:", invalidPduSessionIdResult);
  } catch (e) {
    console.error("Error running tests:", e);
  }
  
  console.groupEnd();
}

/**
 * Create a test request with default values that can be overridden
 */
function createTestRequest(overrides: Partial<SmPolicyContextData> = {}): NpcfSmPolicyCreateRequest {
  return {
    smPolicyContextData: {
      supi: "imsi-123456789012345",
      pduSessionId: 1,
      pduSessionType: "IPv4",
      dnn: "internet",
      notificationUri: "https://smf.example.com/callback",
      sliceInfo: {
        sst: 1,
        sd: "000001"
      },
      servingNetwork: {
        mcc: "234",
        mnc: "015"
      },
      ratType: RatType.NR,
      ipv4Address: "10.0.0.1",
      qosFlowUsage: QosFlowUsage.GENERAL,
      ...overrides
    }
  };
}

// Uncomment to run tests in development
// runSmPolicyTests();
