
// PCF (Policy Control Function) Types based on 3GPP Release 16 specifications

// Reference point between PCF and other network functions
export enum PcfReferencePoint {
  N7 = "N7", // Between PCF and SMF
  N15 = "N15", // Between PCF and AMF
  N5 = "N5", // Between PCF and AF
  N24 = "N24", // Between UDR and PCF
  N29 = "N29", // Between NEF and PCF
  N36 = "N36", // Between PCF and NWDAF
}

// Policy types
export enum PolicyType {
  AM = "Access and Mobility Policy",
  SM = "Session Management Policy",
  UE = "UE Policy",
  QoS = "QoS Policy",
  URSP = "UE Route Selection Policy",
}

// QoS parameters
export interface QosParameters {
  qosIndex: number;
  guaranteedBitRate?: number; // kbps
  maximumBitRate?: number; // kbps
  packetDelayBudget?: number; // ms
  packetErrorRate?: number; // e.g., 10^-6
  priority?: number;
  averagingWindow?: number; // ms
}

// Policy rule
export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  precedence: number;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  status: "active" | "inactive" | "draft";
  createdAt: string;
  updatedAt: string;
}

// Policy condition
export interface PolicyCondition {
  id: string;
  type: "time" | "location" | "applicationId" | "deviceType" | "subscriberGroup" | "custom";
  parameters: Record<string, any>;
}

// Policy action
export interface PolicyAction {
  id: string;
  type: "applyQoS" | "redirect" | "block" | "rate-limit" | "notify" | "custom";
  parameters: Record<string, any>;
}

// PCF session
export interface PcfSession {
  id: string;
  supi: string; // Subscription Permanent Identifier
  policyRules: string[]; // IDs of applied policy rules
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
  qosParameters?: QosParameters;
  relatedNetworkFunctions: {
    type: "AMF" | "SMF" | "UDM" | "UDR" | "NEF" | "AF" | "NWDAF";
    id: string;
  }[];
}

// PCF metrics
export interface PcfMetrics {
  activeSessions: number;
  sessionEstablishmentRate: number; // per second
  sessionModificationRate: number; // per second
  sessionReleaseRate: number; // per second
  policyEvaluationsPerSecond: number;
  averagePolicyEvaluationTime: number; // ms
  numberOfActivePolicies: number;
  cpuUtilization: number; // percentage
  memoryUtilization: number; // percentage
  diskUtilization: number; // percentage
}

// 5G Core Network Function
export interface NetworkFunction {
  id: string;
  type: "AMF" | "SMF" | "UPF" | "PCF" | "UDM" | "AUSF" | "UDR" | "NRF" | "NEF" | "NWDAF";
  name: string;
  status: "active" | "inactive" | "degraded" | "failed";
  ipAddress: string;
  connections: {
    targetFunction: string; // ID of connected function
    referencePoint: string;
    status: "active" | "inactive";
  }[];
}

// Network topology node for visualization
export interface NetworkNode {
  id: string;
  type: NetworkFunction["type"];
  name: string;
  status: NetworkFunction["status"];
  x: number; // Position X
  y: number; // Position Y
}

// Network topology link for visualization
export interface NetworkLink {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  referencePoint: string;
  status: "active" | "inactive";
}

// Network topology for visualization
export interface NetworkTopology {
  nodes: NetworkNode[];
  links: NetworkLink[];
}
