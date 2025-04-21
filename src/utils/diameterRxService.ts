
// Service for processing Diameter Rx interface messages for a Voice/Video/Conference Call
// (Simplified for demo purposes, not a full Diameter RFC implementation)

type MediaType = "voice" | "video" | "data";
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
  };
  subscriberId: string;
  qosClassIdentifier: number; // 1 (Voice), 2 (Video), etc.
  // New properties for upgrades/downgrades and conference mode
  callUpgradeType?: CallUpgradeType;
  conferenceType?: ConferenceType;
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
    };
    subscriberId: string;
    voiceCall: boolean;
    videoCall?: boolean;
    conference?: boolean;
    upgradeType?: CallUpgradeType;
  };
};

/**
 * Process Diameter Rx message for a voice/video/conference call (simplified).
 * Supports: 
 *  - Voice call
 *  - Voice-to-video/video-to-voice upgrade/downgrade
 *  - Conference call
 * @param rxMessage - Diameter Rx request message
 */
export function processDiameterRxForVoice(rxMessage: RxMessage): RxProcessingResult {
  // Validate required fields (very basic check)
  if (!rxMessage || !rxMessage.mediaComponentDescription) {
    return {
      allowed: false,
      message: "Missing media component data."
    };
  }

  const { mediaType } = rxMessage.mediaComponentDescription;
  const callUpgradeType = rxMessage.callUpgradeType ?? "NONE";
  const conferenceType = rxMessage.conferenceType ?? "NONE";
  const { maxRequestedBandwidthUL, maxRequestedBandwidthDL } = rxMessage.mediaComponentDescription;

  // Voice call validation
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
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          conference: true,
          upgradeType: callUpgradeType
        }
      };
    }

    // Voice-to-video upgrade request handling
    if (callUpgradeType === "VOICE_TO_VIDEO") {
      // Accept only if bandwidth for video is reasonable
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
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          videoCall: true,
          upgradeType: callUpgradeType
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
        },
        subscriberId: rxMessage.subscriberId,
        voiceCall: true,
        upgradeType: callUpgradeType
      }
    };
  }

  // Video call validation (including downgrade/upgrade cases)
  if (mediaType === "video") {
    if (maxRequestedBandwidthUL > 2000 || maxRequestedBandwidthDL > 4000) {
      return {
        allowed: false,
        message: "Requested bandwidth for video call exceeds allowed maximum (2 Mbps UL / 4 Mbps DL)."
      };
    }
    // Conference video call
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
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: false,
          videoCall: true,
          conference: true,
          upgradeType: callUpgradeType
        }
      };
    }

    // Video-to-voice downgrade handling
    if (callUpgradeType === "VIDEO_TO_VOICE") {
      // Accept downgrade if the requested bandwidth falls to voice call range
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
          },
          subscriberId: rxMessage.subscriberId,
          voiceCall: true,
          videoCall: false,
          upgradeType: callUpgradeType
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
        },
        subscriberId: rxMessage.subscriberId,
        voiceCall: false,
        videoCall: true,
        upgradeType: callUpgradeType
      }
    };
  }

  // Conference call for unsupported media
  if (conferenceType === "CONFERENCE") {
    return {
      allowed: false,
      message: "Conference call only supported for voice and video.",
    };
  }

  return {
    allowed: false,
    message: "Only voice and video calls are supported in this demo.",
  };
}
