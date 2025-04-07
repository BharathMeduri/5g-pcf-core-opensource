
import { PolicyRule, PolicyType } from "./pcfTypes";

// Mock Policy Rules
export const mockPolicyRules: PolicyRule[] = [
  {
    id: "pol-001",
    name: "Default Internet Access",
    description: "Default policy for Internet access with fair usage limits",
    type: PolicyType.SM,
    precedence: 1000,
    conditions: [
      {
        id: "cond-001",
        type: "applicationId",
        parameters: {
          appId: "internet",
        },
      },
    ],
    actions: [
      {
        id: "act-001",
        type: "applyQoS",
        parameters: {
          qosIndex: 9,
          guaranteedBitRate: 0,
          maximumBitRate: 100000,
        },
      },
    ],
    status: "active",
    createdAt: "2023-03-15T12:00:00Z",
    updatedAt: "2023-03-15T12:00:00Z",
  },
  {
    id: "pol-002",
    name: "Video Streaming Optimization",
    description: "Policy for video streaming services with QoS guarantees",
    type: PolicyType.QoS,
    precedence: 500,
    conditions: [
      {
        id: "cond-002",
        type: "applicationId",
        parameters: {
          appId: "video-streaming",
        },
      },
    ],
    actions: [
      {
        id: "act-002",
        type: "applyQoS",
        parameters: {
          qosIndex: 6,
          guaranteedBitRate: 5000,
          maximumBitRate: 20000,
          packetDelayBudget: 100,
        },
      },
    ],
    status: "active",
    createdAt: "2023-03-20T10:00:00Z",
    updatedAt: "2023-04-02T15:30:00Z",
  },
  {
    id: "pol-003",
    name: "VoLTE Service",
    description: "Policy for Voice over LTE service",
    type: PolicyType.QoS,
    precedence: 100,
    conditions: [
      {
        id: "cond-003",
        type: "applicationId",
        parameters: {
          appId: "volte",
        },
      },
    ],
    actions: [
      {
        id: "act-003",
        type: "applyQoS",
        parameters: {
          qosIndex: 1,
          guaranteedBitRate: 128,
          maximumBitRate: 256,
          packetDelayBudget: 100,
          packetErrorRate: 0.00001,
        },
      },
    ],
    status: "active",
    createdAt: "2023-03-25T09:15:00Z",
    updatedAt: "2023-03-25T09:15:00Z",
  },
  {
    id: "pol-004",
    name: "Enterprise Access",
    description: "Policy for enterprise customer access",
    type: PolicyType.SM,
    precedence: 200,
    conditions: [
      {
        id: "cond-004",
        type: "subscriberGroup",
        parameters: {
          groupId: "enterprise-customers",
        },
      },
    ],
    actions: [
      {
        id: "act-004",
        type: "applyQoS",
        parameters: {
          qosIndex: 8,
          guaranteedBitRate: 10000,
          maximumBitRate: 50000,
        },
      },
    ],
    status: "active",
    createdAt: "2023-04-10T11:30:00Z",
    updatedAt: "2023-04-10T11:30:00Z",
  },
  {
    id: "pol-005",
    name: "IoT Devices",
    description: "Policy for IoT devices with low bandwidth needs",
    type: PolicyType.AM,
    precedence: 300,
    conditions: [
      {
        id: "cond-005",
        type: "deviceType",
        parameters: {
          deviceCategory: "iot",
        },
      },
    ],
    actions: [
      {
        id: "act-005",
        type: "applyQoS",
        parameters: {
          qosIndex: 9,
          guaranteedBitRate: 10,
          maximumBitRate: 100,
        },
      },
    ],
    status: "active",
    createdAt: "2023-04-15T08:45:00Z",
    updatedAt: "2023-04-15T08:45:00Z",
  },
  {
    id: "pol-006",
    name: "Gaming Service",
    description: "Policy for online gaming with low latency",
    type: PolicyType.QoS,
    precedence: 400,
    conditions: [
      {
        id: "cond-006",
        type: "applicationId",
        parameters: {
          appId: "gaming",
        },
      },
    ],
    actions: [
      {
        id: "act-006",
        type: "applyQoS",
        parameters: {
          qosIndex: 7,
          guaranteedBitRate: 1000,
          maximumBitRate: 5000,
          packetDelayBudget: 50,
        },
      },
    ],
    status: "inactive",
    createdAt: "2023-04-20T14:20:00Z",
    updatedAt: "2023-04-20T14:20:00Z",
  },
  {
    id: "pol-007",
    name: "Emergency Services",
    description: "Policy for emergency service access",
    type: PolicyType.AM,
    precedence: 50,
    conditions: [
      {
        id: "cond-007",
        type: "applicationId",
        parameters: {
          appId: "emergency",
        },
      },
    ],
    actions: [
      {
        id: "act-007",
        type: "applyQoS",
        parameters: {
          qosIndex: 1,
          guaranteedBitRate: 256,
          maximumBitRate: 1000,
          priority: 1,
        },
      },
    ],
    status: "active",
    createdAt: "2023-04-25T17:00:00Z",
    updatedAt: "2023-04-25T17:00:00Z",
  },
  {
    id: "pol-008",
    name: "Time-Based Throttling",
    description: "Throttle non-essential traffic during peak hours",
    type: PolicyType.SM,
    precedence: 600,
    conditions: [
      {
        id: "cond-008",
        type: "time",
        parameters: {
          startTime: "18:00",
          endTime: "22:00",
          daysOfWeek: ["MON", "TUE", "WED", "THU", "FRI"],
        },
      },
    ],
    actions: [
      {
        id: "act-008",
        type: "rate-limit",
        parameters: {
          maxBitRate: 2000,
          burstSize: 1024,
        },
      },
    ],
    status: "active",
    createdAt: "2023-05-01T09:30:00Z",
    updatedAt: "2023-05-01T09:30:00Z",
  },
  {
    id: "pol-009",
    name: "Location-Based Policy",
    description: "Special policy for specific location areas",
    type: PolicyType.UE,
    precedence: 700,
    conditions: [
      {
        id: "cond-009",
        type: "location",
        parameters: {
          areaIds: ["area-001", "area-002"],
          areaType: "TAI",
        },
      },
    ],
    actions: [
      {
        id: "act-009",
        type: "applyQoS",
        parameters: {
          qosIndex: 8,
          maximumBitRate: 50000,
        },
      },
    ],
    status: "inactive",
    createdAt: "2023-05-10T11:15:00Z",
    updatedAt: "2023-05-10T11:15:00Z",
  },
  {
    id: "pol-010",
    name: "Roaming Users",
    description: "Policy for users in roaming scenarios",
    type: PolicyType.URSP,
    precedence: 800,
    conditions: [
      {
        id: "cond-010",
        type: "custom",
        parameters: {
          isRoaming: true,
        },
      },
    ],
    actions: [
      {
        id: "act-010",
        type: "applyQoS",
        parameters: {
          qosIndex: 9,
          maximumBitRate: 5000,
        },
      },
      {
        id: "act-010b",
        type: "notify",
        parameters: {
          notificationType: "roaming-usage",
          notificationInterval: 3600,
        },
      },
    ],
    status: "draft",
    createdAt: "2023-05-15T16:40:00Z",
    updatedAt: "2023-05-15T16:40:00Z",
  },
];
