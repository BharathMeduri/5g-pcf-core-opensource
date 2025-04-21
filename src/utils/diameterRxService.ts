
// Service for processing Diameter Rx interface messages for a Voice/Video/Conference Call, including MCPPT and priority support

// Extend MediaType to include "mcptt"
type MediaType = "voice" | "video" | "data" | "mcptt";
type CallUpgradeType = "NONE" | "VOICE_TO_VIDEO" | "VIDEO_TO_VOICE";
type ConferenceType = "NONE" | "CONFERENCE";

type RxMessage = {
  sessionId: string;
  originHost: string;
  originRealm: string;
  destinationRealm: string;
  mediaComponentDescription: {
    mediaType: MediaType;
    flowStatus: "ENABLED" | "DISABLED";
    maxRequestedBandwidthUL: number; // kbps
    maxRequestedBandwidthDL: number; // kbps
    afApplicationIdentifier?: string;
    // For MCPTT support: (optional)
    priorityLevel?: number;
  };
  subscriberId: string;
  qosClassIdentifier: number; // 1 (Voice), 2 (Video), etc.
  // New properties for upgrades/downgrades and conference mode
  callUpgradeType?: CallUpgradeType;
  conferenceType?: ConferenceType;
  // For explicit priority sharing (optional)
  prioritySharing?: boolean;
};

type RxProcessingResult = {
  allowed: boolean;
  message: string;
  policyContext?: {
    policyType: string;
    qos: {
      classId: number;
      maxBandwidthUL: number;
      maxBandwidthDL: number;
      // Support for priorityLevel in QoS (optional)
      priorityLevel?: number;
    };
    subscriberId: string;
    voiceCall: boolean;
    videoCall?: boolean;
    mcpttCall?: boolean;
    conference?: boolean;
    upgradeType?: CallUpgradeType;
    // Priority sharing context
    prioritySharing?: boolean;
  };
};

/**
 * Process Diameter Rx message for voice/video/conference/MCPPT call (extended, simplified).
 * Now supports:
 *  - Voice call, including conference and upgrades/downgrades
 *  - Video call
 *  - Mission Critical Push-To-Talk (MCPPT)
 *  - Priority sharing for calls
 * @param rxMessage - Diameter Rx request message (extended)
 */
export function processDiameterRxForVoice(rxMessage: RxMessage): RxProcessingResult {
  if (!rxMessage || !rxMessage.mediaComponentDescription) {
    return {
      allowed: false,
      message: "Missing media component data."
    };
  }

  const { mediaType, maxRequestedBandwidthUL, maxRequestedBandwidthDL, priorityLevel } = rxMessage.mediaComponentDescription;
  const callUpgradeType = rxMessage.callUpgradeType ?? "NONE";
  const conferenceType = rxMessage.conferenceType ?? "NONE";
  const prioritySharing = rxMessage.prioritySharing === true;

  // --- Voice call validation
  if (mediaType === "voice") {
    if (maxRequestedBandwidthUL > 256 || maxRequestedBandwidthDL > 256) {
      return {
        allowed: false,
        message: "Requested bandwidth for voice call exceeds allowed maximum (256 kbps)."
      };
    }
    // Conference validation (voice-based)
    if (conferenceType === "CONFERENCE") {
      if (maxRequestedBandwidthUL > 512 || maxRequestedBandwidthDL > 512) {
        return {
          allowed: false,
          message: "Conference voice call exceeds allowed maximum bandwidth (512 kbps uplink/downlink)."
        };
      }
      return {
        allowed: true,
        message: "Conference voice call allowed by PCF policy.",
        policyContext: {
          policyType: "voice-conference",
          qos: {
            classId: rxMessage.qosClassIdentifier,
            maxBandwidthUL: maxRequestedBandwidthUL,
            maxBandwidthDL: maxRequestedBandwidthDL,
            priorityLevel,
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          conference: true,
          upgradeType: callUpgradeType,
          prioritySharing,
        }
      };
    }
    // Voice-to-video upgrade request handling
    if (callUpgradeType === "VOICE_TO_VIDEO") {
      if (maxRequestedBandwidthUL > 1500 || maxRequestedBandwidthDL > 2000) {
        return {
          allowed: false,
          message: "Requested bandwidth for voice-to-video upgrade exceeds 1.5 Mbps UL / 2 Mbps DL."
        };
      }
      return {
        allowed: true,
        message: "Voice-to-video call upgrade allowed by PCF policy.",
        policyContext: {
          policyType: "voice-to-video-upgrade",
          qos: {
            classId: rxMessage.qosClassIdentifier,
            maxBandwidthUL: maxRequestedBandwidthUL,
            maxBandwidthDL: maxRequestedBandwidthDL,
            priorityLevel,
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          videoCall: true,
          upgradeType: callUpgradeType,
          prioritySharing,
        }
      };
    }
    // Standard voice call
    return {
      allowed: true,
      message: "Voice call allowed by PCF policy.",
      policyContext: {
        policyType: "voice",
        qos: {
          classId: rxMessage.qosClassIdentifier,
          maxBandwidthUL: maxRequestedBandwidthUL,
          maxBandwidthDL: maxRequestedBandwidthDL,
          priorityLevel,
        },
        subscriberId: rxMessage.subscriberId,
        voiceCall: true,
        upgradeType: callUpgradeType,
        prioritySharing,
      }
    };
  }

  // --- Video call validation (including downgrade/upgrade cases)
  if (mediaType === "video") {
    if (maxRequestedBandwidthUL > 2000 || maxRequestedBandwidthDL > 4000) {
      return {
        allowed: false,
        message: "Requested bandwidth for video call exceeds allowed maximum (2 Mbps UL / 4 Mbps DL)."
      };
    }
    if (conferenceType === "CONFERENCE") {
      if (maxRequestedBandwidthUL > 4000 || maxRequestedBandwidthDL > 8000) {
        return {
          allowed: false,
          message: "Conference video call exceeds allowed maximum bandwidth (4 Mbps UL / 8 Mbps DL)."
        };
      }
      return {
        allowed: true,
        message: "Conference video call allowed by PCF policy.",
        policyContext: {
          policyType: "video-conference",
          qos: {
            classId: rxMessage.qosClassIdentifier,
            maxBandwidthUL: maxRequestedBandwidthUL,
            maxBandwidthDL: maxRequestedBandwidthDL,
            priorityLevel,
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: false,
          videoCall: true,
          conference: true,
          upgradeType: callUpgradeType,
          prioritySharing,
        }
      };
    }
    // Video-to-voice downgrade handling
    if (callUpgradeType === "VIDEO_TO_VOICE") {
      if (maxRequestedBandwidthUL > 256 || maxRequestedBandwidthDL > 256) {
        return {
          allowed: false,
          message: "Video-to-voice downgrade bandwidth must not exceed 256 kbps."
        };
      }
      return {
        allowed: true,
        message: "Video-to-voice call downgrade allowed by PCF policy.",
        policyContext: {
          policyType: "video-to-voice-downgrade",
          qos: {
            classId: rxMessage.qosClassIdentifier,
            maxBandwidthUL: maxRequestedBandwidthUL,
            maxBandwidthDL: maxRequestedBandwidthDL,
            priorityLevel,
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          videoCall: false,
          upgradeType: callUpgradeType,
          prioritySharing,
        }
      };
    }
    // Regular video call
    return {
      allowed: true,
      message: "Video call allowed by PCF policy.",
      policyContext: {
        policyType: "video",
        qos: {
          classId: rxMessage.qosClassIdentifier,
          maxBandwidthUL: maxRequestedBandwidthUL,
          maxBandwidthDL: maxRequestedBandwidthDL,
          priorityLevel,
        },
        subscriberId: rxMessage.subscriberId,
        voiceCall: false,
        videoCall: true,
        upgradeType: callUpgradeType,
        prioritySharing,
      }
    };
  }

  // --- MCPTT (Mission Critical Push-To-Talk) call validation
  if (mediaType === "mcptt") {
    // For MCPTT, allow higher bandwidth and require a priorityLevel
    if (typeof priorityLevel !== "number" || priorityLevel < 1 || priorityLevel > 15) {
      return {
        allowed: false,
        message: "MCPTT call requires a valid priorityLevel (1-15)."
      };
    }
    if (maxRequestedBandwidthUL > 1024 || maxRequestedBandwidthDL > 1024) {
      return {
        allowed: false,
        message: "Requested bandwidth for MCPTT call exceeds allowed maximum (1024 kbps)."
      };
    }
    if (conferenceType === "CONFERENCE") {
      // For MCPTT conference allow double bandwidth
      if (maxRequestedBandwidthUL > 2048 || maxRequestedBandwidthDL > 2048) {
        return {
          allowed: false,
          message: "Conference MCPTT call exceeds allowed maximum bandwidth (2048 kbps uplink/downlink)."
        };
      }
      return {
        allowed: true,
        message: "Conference MCPTT call allowed with priority sharing.",
        policyContext: {
          policyType: "mcptt-conference",
          qos: {
            classId: rxMessage.qosClassIdentifier,
            maxBandwidthUL: maxRequestedBandwidthUL,
            maxBandwidthDL: maxRequestedBandwidthDL,
            priorityLevel,
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          mcpttCall: true,
          conference: true,
          prioritySharing: true, // MCPTT conferences always enable priority sharing
        }
      };
    }
    // Standard MCPTT voice call
    return {
      allowed: true,
      message: "MCPTT voice call allowed with priority sharing.",
      policyContext: {
        policyType: "mcptt",
        qos: {
          classId: rxMessage.qosClassIdentifier,
          maxBandwidthUL: maxRequestedBandwidthUL,
          maxBandwidthDL: maxRequestedBandwidthDL,
          priorityLevel,
        },
        subscriberId: rxMessage.subscriberId,
        voiceCall: true,
        mcpttCall: true,
        conference: false,
        prioritySharing: true,
      }
    };
  }

  // --- Conference fallback for unsupported media
  if (conferenceType === "CONFERENCE") {
    return {
      allowed: false,
      message: "Conference call only supported for voice, video, and MCPTT in this demo.",
    };
  }

  return {
    allowed: false,
    message: "Only voice, video, and MCPTT calls are supported in this demo.",
  };
}

