
import type { RxMessage } from "./diameterRxService";

/**
 * SBI JSON representation for a Diameter Rx message (simplified).
 * This example assumes mapping to an openAPI-style SBI used in 5G PCF.
 */
export type SbiMessage = {
  session: string;
  sourceHost: string;
  sourceRealm: string;
  destRealm: string;
  media: {
    type: string;
    uplinkKbps: number;
    downlinkKbps: number;
    flowStatus: string;
    qosClassId: number;
    afAppId?: string;
    priority?: number;
  };
  subscriber: string;
  callUpgrade?: string;
  conferenceType?: string;
  prioritySharing?: boolean;
};

/**
 * Converts a Diameter Rx message to SBI-compliant HTTP2 JSON
 */
export function encodeDiameterToSbi(diameterMsg: RxMessage): SbiMessage {
  return {
    session: diameterMsg.sessionId,
    sourceHost: diameterMsg.originHost,
    sourceRealm: diameterMsg.originRealm,
    destRealm: diameterMsg.destinationRealm,
    media: {
      type: diameterMsg.mediaComponentDescription.mediaType,
      uplinkKbps: diameterMsg.mediaComponentDescription.maxRequestedBandwidthUL,
      downlinkKbps: diameterMsg.mediaComponentDescription.maxRequestedBandwidthDL,
      flowStatus: diameterMsg.mediaComponentDescription.flowStatus,
      qosClassId: diameterMsg.qosClassIdentifier,
      afAppId: diameterMsg.mediaComponentDescription.afApplicationIdentifier,
      priority: diameterMsg.mediaComponentDescription.priorityLevel,
    },
    subscriber: diameterMsg.subscriberId,
    callUpgrade: diameterMsg.callUpgradeType,
    conferenceType: diameterMsg.conferenceType,
    prioritySharing: diameterMsg.prioritySharing,
  };
}

/**
 * Converts an SBI HTTP2 JSON message to Diameter Rx format
 */
export function decodeSbiToDiameter(sbiMsg: SbiMessage): RxMessage {
  return {
    sessionId: sbiMsg.session,
    originHost: sbiMsg.sourceHost,
    originRealm: sbiMsg.sourceRealm,
    destinationRealm: sbiMsg.destRealm,
    mediaComponentDescription: {
      mediaType: sbiMsg.media.type as RxMessage["mediaComponentDescription"]["mediaType"],
      flowStatus: sbiMsg.media.flowStatus as "ENABLED" | "DISABLED",
      maxRequestedBandwidthUL: sbiMsg.media.uplinkKbps,
      maxRequestedBandwidthDL: sbiMsg.media.downlinkKbps,
      afApplicationIdentifier: sbiMsg.media.afAppId,
      priorityLevel: sbiMsg.media.priority,
    },
    subscriberId: sbiMsg.subscriber,
    qosClassIdentifier: sbiMsg.media.qosClassId,
    callUpgradeType: (sbiMsg.callUpgrade ?? "NONE") as RxMessage["callUpgradeType"],
    conferenceType: (sbiMsg.conferenceType ?? "NONE") as RxMessage["conferenceType"],
    prioritySharing: !!sbiMsg.prioritySharing,
  };
}

