
import { 
  NetworkFunction, 
  NetworkTopology, 
  PcfMetrics, 
  PcfSession, 
  PolicyRule, 
  PolicyType 
} from "./pcfTypes";

// Mock Network Functions
export const mockNetworkFunctions: NetworkFunction[] = [
  {
    id: "pcf-001",
    type: "PCF",
    name: "Policy Control Function",
    status: "active",
    ipAddress: "10.10.10.10",
    connections: [
      { targetFunction: "smf-001", referencePoint: "N7", status: "active" },
      { targetFunction: "amf-001", referencePoint: "N15", status: "active" },
      { targetFunction: "udr-001", referencePoint: "N24", status: "active" },
      { targetFunction: "nef-001", referencePoint: "N29", status: "active" },
      { targetFunction: "nwdaf-001", referencePoint: "N36", status: "inactive" },
    ],
  },
  {
    id: "amf-001",
    type: "AMF",
    name: "Access and Mobility Management Function",
    status: "active",
    ipAddress: "10.10.10.11",
    connections: [
      { targetFunction: "pcf-001", referencePoint: "N15", status: "active" },
      { targetFunction: "smf-001", referencePoint: "N11", status: "active" },
    ],
  },
  {
    id: "smf-001",
    type: "SMF",
    name: "Session Management Function",
    status: "active",
    ipAddress: "10.10.10.12",
    connections: [
      { targetFunction: "pcf-001", referencePoint: "N7", status: "active" },
      { targetFunction: "amf-001", referencePoint: "N11", status: "active" },
      { targetFunction: "upf-001", referencePoint: "N4", status: "active" },
    ],
  },
  {
    id: "upf-001",
    type: "UPF",
    name: "User Plane Function",
    status: "active",
    ipAddress: "10.10.10.13",
    connections: [
      { targetFunction: "smf-001", referencePoint: "N4", status: "active" },
    ],
  },
  {
    id: "udr-001",
    type: "UDR",
    name: "Unified Data Repository",
    status: "active",
    ipAddress: "10.10.10.14",
    connections: [
      { targetFunction: "pcf-001", referencePoint: "N24", status: "active" },
    ],
  },
  {
    id: "nef-001",
    type: "NEF",
    name: "Network Exposure Function",
    status: "degraded",
    ipAddress: "10.10.10.15",
    connections: [
      { targetFunction: "pcf-001", referencePoint: "N29", status: "active" },
    ],
  },
  {
    id: "nwdaf-001",
    type: "NWDAF",
    name: "Network Data Analytics Function",
    status: "inactive",
    ipAddress: "10.10.10.16",
    connections: [
      { targetFunction: "pcf-001", referencePoint: "N36", status: "inactive" },
    ],
  },
];

// Mock Network Topology
export const mockNetworkTopology: NetworkTopology = {
  nodes: [
    { id: "pcf-001", type: "PCF", name: "PCF", status: "active", x: 400, y: 250 },
    { id: "amf-001", type: "AMF", name: "AMF", status: "active", x: 250, y: 150 },
    { id: "smf-001", type: "SMF", name: "SMF", status: "active", x: 550, y: 150 },
    { id: "upf-001", type: "UPF", name: "UPF", status: "active", x: 550, y: 350 },
    { id: "udr-001", type: "UDR", name: "UDR", status: "active", x: 250, y: 350 },
    { id: "nef-001", type: "NEF", name: "NEF", status: "degraded", x: 400, y: 100 },
    { id: "nwdaf-001", type: "NWDAF", name: "NWDAF", status: "inactive", x: 400, y: 400 },
  ],
  links: [
    { id: "link-1", source: "pcf-001", target: "smf-001", referencePoint: "N7", status: "active" },
    { id: "link-2", source: "pcf-001", target: "amf-001", referencePoint: "N15", status: "active" },
    { id: "link-3", source: "pcf-001", target: "udr-001", referencePoint: "N24", status: "active" },
    { id: "link-4", source: "pcf-001", target: "nef-001", referencePoint: "N29", status: "active" },
    { id: "link-5", source: "pcf-001", target: "nwdaf-001", referencePoint: "N36", status: "inactive" },
    { id: "link-6", source: "smf-001", target: "upf-001", referencePoint: "N4", status: "active" },
    { id: "link-7", source: "smf-001", target: "amf-001", referencePoint: "N11", status: "active" },
  ],
};

// Mock PCF Metrics
export const mockPcfMetrics: PcfMetrics = {
  activeSessions: 12583,
  sessionEstablishmentRate: 42.7,
  sessionModificationRate: 18.3,
  sessionReleaseRate: 38.9,
  policyEvaluationsPerSecond: 235.6,
  averagePolicyEvaluationTime: 8.3,
  numberOfActivePolicies: 48,
  cpuUtilization: 38,
  memoryUtilization: 45,
  diskUtilization: 22,
};

// Mock Policy Rules
export const mockPolicyRules: PolicyRule[] = [
  {
    id: "policy-001",
    name: "Premium Subscriber QoS",
    description: "Guarantees high QoS for premium subscribers",
    type: PolicyType.QoS,
    precedence: 10,
    conditions: [
      {
        id: "cond-001",
        type: "subscriberGroup",
        parameters: { group: "premium" },
      },
    ],
    actions: [
      {
        id: "act-001",
        type: "applyQoS",
        parameters: { 
          qosIndex: 5, 
          guaranteedBitRate: 50000, 
          maximumBitRate: 100000,
          packetDelayBudget: 100,
        },
      },
    ],
    status: "active",
    createdAt: "2025-03-12T10:00:00Z",
    updatedAt: "2025-04-01T15:30:00Z",
  },
  {
    id: "policy-002",
    name: "Streaming Video Optimization",
    description: "Optimizes QoS for video streaming applications",
    type: PolicyType.QoS,
    precedence: 20,
    conditions: [
      {
        id: "cond-002",
        type: "applicationId",
        parameters: { appIds: ["streaming-video", "video-conferencing"] },
      },
    ],
    actions: [
      {
        id: "act-002",
        type: "applyQoS",
        parameters: { 
          qosIndex: 3, 
          guaranteedBitRate: 10000, 
          maximumBitRate: 30000,
          packetDelayBudget: 150,
        },
      },
    ],
    status: "active",
    createdAt: "2025-03-15T14:20:00Z",
    updatedAt: "2025-04-02T09:15:00Z",
  },
  {
    id: "policy-003",
    name: "IoT Device Rate Limiting",
    description: "Limits bandwidth for IoT devices",
    type: PolicyType.SM,
    precedence: 30,
    conditions: [
      {
        id: "cond-003",
        type: "deviceType",
        parameters: { deviceTypes: ["iot", "sensor"] },
      },
    ],
    actions: [
      {
        id: "act-003",
        type: "rate-limit",
        parameters: { maxBitRateKbps: 1000 },
      },
    ],
    status: "active",
    createdAt: "2025-03-18T08:40:00Z",
    updatedAt: "2025-03-18T08:40:00Z",
  },
  {
    id: "policy-004",
    name: "Off-peak Hours Boost",
    description: "Increases bandwidth during off-peak hours",
    type: PolicyType.QoS,
    precedence: 40,
    conditions: [
      {
        id: "cond-004",
        type: "time",
        parameters: { 
          startTime: "22:00:00", 
          endTime: "06:00:00", 
          daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] 
        },
      },
    ],
    actions: [
      {
        id: "act-004",
        type: "applyQoS",
        parameters: { 
          qosIndex: 2, 
          maximumBitRate: 50000,
        },
      },
    ],
    status: "inactive",
    createdAt: "2025-03-20T16:10:00Z",
    updatedAt: "2025-03-25T11:05:00Z",
  },
  {
    id: "policy-005",
    name: "Emergency Services Priority",
    description: "Ensures priority for emergency service traffic",
    type: PolicyType.AM,
    precedence: 5,
    conditions: [
      {
        id: "cond-005",
        type: "applicationId",
        parameters: { appIds: ["emergency-services", "public-safety"] },
      },
    ],
    actions: [
      {
        id: "act-005",
        type: "applyQoS",
        parameters: { 
          qosIndex: 1, 
          priority: 1,
          packetDelayBudget: 50,
        },
      },
    ],
    status: "active",
    createdAt: "2025-03-05T09:30:00Z",
    updatedAt: "2025-03-05T09:30:00Z",
  },
];

// Mock PCF Sessions
export const mockPcfSessions: PcfSession[] = [
  {
    id: "session-001",
    supi: "imsi-310150123456789",
    policyRules: ["policy-001"],
    status: "active",
    createdAt: "2025-04-05T14:30:22Z",
    updatedAt: "2025-04-05T14:30:22Z",
    qosParameters: {
      qosIndex: 5,
      guaranteedBitRate: 50000,
      maximumBitRate: 100000,
      packetDelayBudget: 100,
      packetErrorRate: 0.000001,
      priority: 15,
      averagingWindow: 2000,
    },
    relatedNetworkFunctions: [
      { type: "AMF", id: "amf-001" },
      { type: "SMF", id: "smf-001" },
    ],
  },
  {
    id: "session-002",
    supi: "imsi-310150123456790",
    policyRules: ["policy-002"],
    status: "active",
    createdAt: "2025-04-05T15:12:45Z",
    updatedAt: "2025-04-05T15:15:10Z",
    qosParameters: {
      qosIndex: 3,
      guaranteedBitRate: 10000,
      maximumBitRate: 30000,
      packetDelayBudget: 150,
      packetErrorRate: 0.00001,
      priority: 25,
      averagingWindow: 2000,
    },
    relatedNetworkFunctions: [
      { type: "AMF", id: "amf-001" },
      { type: "SMF", id: "smf-001" },
    ],
  },
  {
    id: "session-003",
    supi: "imsi-310150123456791",
    policyRules: ["policy-003"],
    status: "active",
    createdAt: "2025-04-05T16:03:18Z",
    updatedAt: "2025-04-05T16:03:18Z",
    qosParameters: {
      qosIndex: 9,
      maximumBitRate: 1000,
      packetDelayBudget: 300,
      packetErrorRate: 0.0001,
      priority: 50,
      averagingWindow: 2000,
    },
    relatedNetworkFunctions: [
      { type: "AMF", id: "amf-001" },
      { type: "SMF", id: "smf-001" },
    ],
  },
  {
    id: "session-004",
    supi: "imsi-310150123456792",
    policyRules: ["policy-005"],
    status: "active",
    createdAt: "2025-04-05T16:45:32Z",
    updatedAt: "2025-04-05T16:45:32Z",
    qosParameters: {
      qosIndex: 1,
      guaranteedBitRate: 20000,
      maximumBitRate: 40000,
      packetDelayBudget: 50,
      packetErrorRate: 0.0000001,
      priority: 1,
      averagingWindow: 2000,
    },
    relatedNetworkFunctions: [
      { type: "AMF", id: "amf-001" },
      { type: "SMF", id: "smf-001" },
    ],
  },
  {
    id: "session-005",
    supi: "imsi-310150123456793",
    policyRules: [],
    status: "pending",
    createdAt: "2025-04-05T17:20:14Z",
    updatedAt: "2025-04-05T17:20:14Z",
    relatedNetworkFunctions: [
      { type: "AMF", id: "amf-001" },
    ],
  },
];

// Mock historical data for charts
export const mockHistoricalPcfMetrics = {
  timestamps: [
    "2025-04-05T12:00:00Z", "2025-04-05T13:00:00Z", "2025-04-05T14:00:00Z", 
    "2025-04-05T15:00:00Z", "2025-04-05T16:00:00Z", "2025-04-05T17:00:00Z"
  ],
  activeSessions: [12100, 12250, 12400, 12520, 12560, 12583],
  policyEvaluations: [220, 228, 235, 242, 238, 235],
  cpuUtilization: [32, 35, 38, 42, 40, 38],
  memoryUtilization: [39, 42, 44, 45, 46, 45],
};
