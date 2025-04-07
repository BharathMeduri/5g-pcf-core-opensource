
// SM Policy Control Types based on 3GPP Release 16 specifications
// For Npcf_SMPolicy Service

import { PolicyType } from "./pcfTypes";

// SM Policy Decision
export interface SmPolicyDecision {
  id: string;
  sessionRules?: Record<string, SessionRule>;
  pccRules?: Record<string, PccRule>;
  qosDecs?: Record<string, QosDecision>;
  chgDecs?: Record<string, ChargingDecision>;
  traffContDecs?: Record<string, TrafficControlDecision>;
  umDecs?: Record<string, UsageMonitoringDecision>;
  qosChars?: Record<string, QosCharacteristics>;
  reflectiveQoSTimer?: number;
  offline?: boolean;
  online?: boolean;
  conds?: Record<string, ConditionData>;
  revalidationTime?: string;
  policyCtrlReqTriggers?: PolicyControlRequestTrigger[];
}

// SM Policy Context Data
export interface SmPolicyContextData {
  supi: string;
  pduSessionId: number;
  pduSessionType: "IPv4" | "IPv6" | "IPv4v6" | "Ethernet" | "Unstructured";
  dnn: string;
  notificationUri: string;
  sliceInfo?: {
    sst: number;
    sd?: string;
  };
  servingNetwork?: {
    mcc: string;
    mnc: string;
  };
  ratType?: RatType;
  ipv4Address?: string;
  ipv6AddressPrefix?: string;
  gpsi?: string;
  suppFeat?: string; // Supported features bitmap string
  chargingCharacteristics?: string;
  chfInfo?: {
    primaryChfAddress: string;
    secondaryChfAddress?: string;
  };
  ueTimeZone?: string;
  refQosIndication?: boolean;
  qosFlowUsage?: QosFlowUsage;
}

// Session Rule
export interface SessionRule {
  authSessAmbr?: {
    uplink?: string; // Example: "100 Mbps"
    downlink?: string; // Example: "200 Mbps"
  };
  authDefQos?: {
    qosId?: number;
    arp?: {
      priorityLevel: number;
      preemptCap: "NOT_PREEMPT" | "MAY_PREEMPT";
      preemptVuln: "NOT_PREEMPTABLE" | "PREEMPTABLE";
    };
    qnc?: boolean; // QoS Notification Control
    priorityLevel?: number;
    averWindow?: number;
    maxDataBurstVol?: number;
  };
  sessRuleId: string;
  refUmData?: string; // Reference to UsageMonitoringData
  refCondData?: string; // Reference to ConditionData
}

// PCC Rule (Policy and Charging Control Rule)
export interface PccRule {
  pccRuleId: string;
  flowInfos?: Array<{
    flowDescription?: string; // Example: "permit out ip from 10.60.0.0/16 to any"
    ethFlowDescription?: {
      destMacAddr?: string;
      ethType?: string;
      fDesc?: string;
      sourceMacAddr?: string;
      vlanTags?: string[];
    };
  }>;
  appId?: string;
  appDescriptor?: string;
  contVer?: number;
  precedence?: number;
  refQosData?: string[];
  refTcData?: string[];
  refChgData?: string[];
  refUmData?: string[];
  refCondData?: string;
}

// QoS Decision
export interface QosDecision {
  qosId: string;
  qosParams?: {
    qos5qi?: number;
    maxbrUl?: string;
    maxbrDl?: string;
    gbrUl?: string;
    gbrDl?: string;
    arp?: {
      priorityLevel: number;
      preemptCap: "NOT_PREEMPT" | "MAY_PREEMPT";
      preemptVuln: "NOT_PREEMPTABLE" | "PREEMPTABLE";
    };
    qnc?: boolean;
    reflectiveQos?: boolean;
    sharingKeyDl?: string;
    sharingKeyUl?: string;
    maxPacketLossRateDl?: number;
    maxPacketLossRateUl?: number;
    defQosFlowIndication?: boolean;
  };
}

// QoS Characteristics
export interface QosCharacteristics {
  qosCharId: string;
  qosType: "STANDARDIZED" | "NON_STANDARDIZED";
  priority?: number;
  packetDelayBudget?: number; // in milliseconds
  packetErrorRate?: string; // Example: "10^-6"
  averagingWindow?: number;
  maxDataBurstVol?: number;
}

// Charging Decision
export interface ChargingDecision {
  chgId: string;
  offline?: boolean;
  online?: boolean;
  sdfHandl?: boolean;
  ratingGroup?: number;
  reportingLevel?: "SERVICE_IDENTIFIER_LEVEL" | "RATING_GROUP_LEVEL" | "SPONSORED_CONNECTIVITY_LEVEL";
  serviceId?: number;
  sponsorId?: string;
  appSvcProvId?: string;
  afChargingIdentifier?: number;
}

// Traffic Control Decision
export interface TrafficControlDecision {
  tcId: string;
  flowStatus?: "ENABLED" | "DISABLED" | "ENABLED_UPLINK" | "ENABLED_DOWNLINK";
  redirectInfo?: {
    redirectEnabled: boolean;
    redirectAddressType?: "IPv4_ADDR" | "IPv6_ADDR" | "URL" | "SIP_URI";
    redirectServerAddress?: string;
  };
  muteNotif?: boolean;
  trafficSteeringPolIdDl?: string;
  trafficSteeringPolIdUl?: string;
  routeToLocs?: Array<{
    dnai: string;
    routeInfo?: {
      ipv4Addr?: string;
      ipv6Addr?: string;
      portNumber?: number;
    };
    routeProfId?: string;
  }>;
}

// Usage Monitoring Decision
export interface UsageMonitoringDecision {
  umId: string;
  volumeThreshold?: {
    totalVolume?: number;
    uplinkVolume?: number;
    downlinkVolume?: number;
  };
  timeThreshold?: number;
  monitoringTime?: string;
  nextVolThreshold?: {
    totalVolume?: number;
    uplinkVolume?: number;
    downlinkVolume?: number;
  };
  inactivityTime?: number;
  exUsagePccRuleIds?: string[];
}

// Condition Data
export interface ConditionData {
  condId: string;
  activationTime?: string;
  deactivationTime?: string;
  accessType?: AccessType;
  ratType?: RatType;
}

// Policy Control Request Trigger
export enum PolicyControlRequestTrigger {
  PLMN_CH = "PLMN_CH", // PLMN Change
  RES_MO_RE = "RES_MO_RE", // UE (SGSN) Initiated PDN Resource Modification
  AC_TY_CH = "AC_TY_CH", // Access Type Change
  UE_IP_CH = "UE_IP_CH", // UE IP address change
  UE_MAC_CH = "UE_MAC_CH", // UE MAC address change
  AN_CH_COR = "AN_CH_COR", // Access Network Charging Correlation Information
  US_RE = "US_RE", // Usage Report
  APP_STA = "APP_STA", // Application Start
  APP_STO = "APP_STO", // Application Stop
  AN_INFO = "AN_INFO", // Access Network Information report
  CM_SES_FAIL = "CM_SES_FAIL", // Credit management session failure
  PS_DA_OFF = "PS_DA_OFF", // Default QoS change
  DEF_QOS_CH = "DEF_QOS_CH", // Default QoS change
  SE_AMBR_CH = "SE_AMBR_CH", // Session AMBR change
  QOS_NOTIF = "QOS_NOTIF", // PCF initiated QoS notification
  NO_QOS_SUPPORT = "NO_QOS_SUPPORT", // No QoS flow can be established
  PRA_CH = "PRA_CH", // Presence Reporting Area Information Change
  SAREA_CH = "SAREA_CH", // Service Area Restriction Change
  SCNN_CH = "SCNN_CH", // SGSN CN type change
  RE_TIMEOUT = "RE_TIMEOUT", // Re-validation timeout
  RES_RELEASE = "RES_RELEASE", // Indicates that the PDU session or bearer is released
  SUCC_RES_ALLO = "SUCC_RES_ALLO", // Successful resource allocation
  RAT_TY_CH = "RAT_TY_CH", // RAT Type Change
  REF_QOS_IND_CH = "REF_QOS_IND_CH", // Reflective QoS indication Change
  NUM_OF_PACKET_FILTER = "NUM_OF_PACKET_FILTER", // Notification that the number of supported packet filter for signalled QoS rules
  UE_STATUS_RESUME = "UE_STATUS_RESUME", // UE Status Resume
  UE_TZ_CH = "UE_TZ_CH", // UE Time Zone Change
  AUTH_PROF_CH = "AUTH_PROF_CH", // Notification that the related authorization profile has changed
  QOS_MONITORING = "QOS_MONITORING", // QoS Monitoring
  SCELL_CH = "SCELL_CH", // Serving Cell Change
  USER_LOCATION_CH = "USER_LOCATION_CH", // User Location Change
  EPS_FALLBACK = "EPS_FALLBACK", // EPS Fallback
}

// RAT Type
export enum RatType {
  NR = "NR",
  EUTRA = "EUTRA",
  WLAN = "WLAN",
  VIRTUAL = "VIRTUAL",
  NBIOT = "NBIOT",
  LTE_M = "LTE_M",
  NR_U = "NR_U",
  EUTRA_U = "EUTRA_U",
  TRUSTED_N3GA = "TRUSTED_N3GA",
  TRUSTED_WLAN = "TRUSTED_WLAN",
  UTRA = "UTRA",
  GERA = "GERA",
}

// Access Type
export enum AccessType {
  THREEGPP_ACCESS = "3GPP_ACCESS",
  NON_THREEGPP_ACCESS = "NON_3GPP_ACCESS",
}

// QoS Flow Usage
export enum QosFlowUsage {
  GENERAL = "GENERAL",
  IMS_SIG = "IMS_SIG",
}

// Npcf_SMPolicy Service Operation
export enum NpcfSmPolicyOperation {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  GET = "GET",
}

// Npcf_SMPolicy Service Response
export interface NpcfSmPolicyResponse {
  status: "SUCCESS" | "FAILURE";
  data?: SmPolicyDecision;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Npcf_SMPolicy Create Request
export interface NpcfSmPolicyCreateRequest {
  smPolicyContextData: SmPolicyContextData;
}

// Npcf_SMPolicy Update Request
export interface NpcfSmPolicyUpdateRequest {
  smPolicyContextData: Partial<SmPolicyContextData>;
  policyControlRequestTriggers?: PolicyControlRequestTrigger[];
  repPolicyCtrlReqTriggers?: PolicyControlRequestTrigger[];
  accNetChIds?: Array<{
    accNetChaIdValue: string;
    refPccRuleIds?: string[];
    sessionChScope?: boolean;
  }>;
  accessType?: AccessType;
  ratType?: RatType;
  addAccessInfo?: {
    accessType: AccessType;
    ratType?: RatType;
  };
  relAccessInfo?: AccessType;
  userLocationInfo?: {
    eutraLocation?: {
      tai: {
        plmnId: {
          mcc: string;
          mnc: string;
        };
        tac: string;
      };
      ecgi: {
        plmnId: {
          mcc: string;
          mnc: string;
        };
        eutraCellId: string;
      };
      ageOfLocationInformation?: number;
      ueLocationTimestamp?: string;
      geographicalInformation?: string;
      geodeticInformation?: string;
    };
    nrLocation?: {
      tai: {
        plmnId: {
          mcc: string;
          mnc: string;
        };
        tac: string;
      };
      ncgi: {
        plmnId: {
          mcc: string;
          mnc: string;
        };
        nrCellId: string;
      };
      ageOfLocationInformation?: number;
      ueLocationTimestamp?: string;
      geographicalInformation?: string;
      geodeticInformation?: string;
    };
  };
}

// Mock Data
export const mockSmPolicyContextData: SmPolicyContextData = {
  supi: "imsi-123456789012345",
  pduSessionId: 1,
  pduSessionType: "IPv4",
  dnn: "internet",
  notificationUri: "https://smf.5gc.mnc015.mcc234.pub.3gppnetwork.org/sm-policy-control/v1/notification",
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
  gpsi: "msisdn-447700900000",
  suppFeat: "3fff",
  chargingCharacteristics: "0800",
  chfInfo: {
    primaryChfAddress: "https://chf.5gc.mnc015.mcc234.pub.3gppnetwork.org"
  },
  ueTimeZone: "+01:00",
  refQosIndication: true,
  qosFlowUsage: QosFlowUsage.GENERAL
};

// Mock Policy Decision
export const mockSmPolicyDecision: SmPolicyDecision = {
  id: "sm-policy-decision-001",
  sessionRules: {
    "sess-rule-001": {
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
      sessRuleId: "sess-rule-001"
    }
  },
  pccRules: {
    "pcc-rule-001": {
      pccRuleId: "pcc-rule-001",
      flowInfos: [
        {
          flowDescription: "permit out ip from 10.60.0.0/16 to any"
        }
      ],
      precedence: 1,
      refQosData: ["qos-001"],
      refChgData: ["chg-001"]
    },
    "pcc-rule-002": {
      pccRuleId: "pcc-rule-002",
      appId: "facebook",
      precedence: 50,
      refQosData: ["qos-002"],
      refChgData: ["chg-002"],
      refTcData: ["tc-001"]
    }
  },
  qosDecs: {
    "qos-001": {
      qosId: "qos-001",
      qosParams: {
        qos5qi: 9,
        maxbrUl: "50 Mbps",
        maxbrDl: "100 Mbps",
        arp: {
          priorityLevel: 1,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "NOT_PREEMPTABLE"
        },
        qnc: false
      }
    },
    "qos-002": {
      qosId: "qos-002",
      qosParams: {
        qos5qi: 6,
        maxbrUl: "2 Mbps",
        maxbrDl: "10 Mbps",
        arp: {
          priorityLevel: 4,
          preemptCap: "NOT_PREEMPT",
          preemptVuln: "PREEMPTABLE"
        }
      }
    }
  },
  chgDecs: {
    "chg-001": {
      chgId: "chg-001",
      offline: true,
      online: true,
      ratingGroup: 10,
      reportingLevel: "SERVICE_IDENTIFIER_LEVEL",
      serviceId: 1
    },
    "chg-002": {
      chgId: "chg-002",
      offline: true,
      online: true,
      ratingGroup: 20
    }
  },
  traffContDecs: {
    "tc-001": {
      tcId: "tc-001",
      flowStatus: "ENABLED"
    }
  },
  umDecs: {
    "um-001": {
      umId: "um-001",
      volumeThreshold: {
        totalVolume: 1000000000,
        uplinkVolume: 500000000,
        downlinkVolume: 500000000
      },
      timeThreshold: 3600
    }
  }
};

// Mock Response for SM Policy Creation
export const mockSmPolicyCreateResponse: NpcfSmPolicyResponse = {
  status: "SUCCESS",
  data: mockSmPolicyDecision
};
