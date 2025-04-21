
// --- Type Definitions (will remain for now, but can be separated in further refactor)
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
    priorityLevel?: number;
  };
  subscriberId: string;
  qosClassIdentifier: number; // 1 (Voice), 2 (Video), etc.
  callUpgradeType?: CallUpgradeType;
  conferenceType?: ConferenceType;
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
      priorityLevel?: number;
    };
    subscriberId: string;
    voiceCall: boolean;
    videoCall?: boolean;
    mcpttCall?: boolean;
    conference?: boolean;
    upgradeType?: CallUpgradeType;
    prioritySharing?: boolean;
  };
};

// --- Voice call processor
function processVoiceCall(
  rxMessage: RxMessage,
  callUpgradeType: CallUpgradeType,
  conferenceType: ConferenceType,
  prioritySharing: boolean
): RxProcessingResult {
  const { maxRequestedBandwidthUL, maxRequestedBandwidthDL, priorityLevel } = rxMessage.mediaComponentDescription;

  if (maxRequestedBandwidthUL > 256 || maxRequestedBandwidthDL > 256) {
    return {
      allowed: false,
      message: "Requested bandwidth for voice call exceeds allowed maximum (256 kbps)."
    };
  }
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

// --- Video call processor
function processVideoCall(
  rxMessage: RxMessage,
  callUpgradeType: CallUpgradeType,
  conferenceType: ConferenceType,
  prioritySharing: boolean
): RxProcessingResult {
  const { maxRequestedBandwidthUL, maxRequestedBandwidthDL, priorityLevel } = rxMessage.mediaComponentDescription;

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

// --- MCPPT call processor (Mission Critical PTT)
function processMcpttCall(
  rxMessage: RxMessage,
  conferenceType: ConferenceType
): RxProcessingResult {
  const { maxRequestedBandwidthUL, maxRequestedBandwidthDL, priorityLevel } = rxMessage.mediaComponentDescription;
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

/**
 * Process Diameter Rx message for voice/video/conference/MCPPT call (extended, refactored).
 */
export function processDiameterRxForVoice(rxMessage: RxMessage): RxProcessingResult {
  if (!rxMessage || !rxMessage.mediaComponentDescription) {
    return {
      allowed: false,
      message: "Missing media component data."
    };
  }

  const { mediaType } = rxMessage.mediaComponentDescription;
  const callUpgradeType = rxMessage.callUpgradeType ?? "NONE";
  const conferenceType = rxMessage.conferenceType ?? "NONE";
  const prioritySharing = rxMessage.prioritySharing === true;

  switch (mediaType) {
    case "voice":
      return processVoiceCall(rxMessage, callUpgradeType, conferenceType, prioritySharing);
    case "video":
      return processVideoCall(rxMessage, callUpgradeType, conferenceType, prioritySharing);
    case "mcptt":
      return processMcpttCall(rxMessage, conferenceType);
    default:
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
}
