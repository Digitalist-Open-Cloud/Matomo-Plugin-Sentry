import { SentryEvent, SentryResponse } from '@sentry/types';
import { BaseTransport } from './base';
/** `sendBeacon` based transport */
export declare class BeaconTransport extends BaseTransport {
    /**
     * @inheritDoc
     */
    captureEvent(event: SentryEvent): Promise<SentryResponse>;
}
