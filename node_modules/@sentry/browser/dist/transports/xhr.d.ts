import { SentryEvent, SentryResponse } from '@sentry/types';
import { BaseTransport } from './base';
/** `XHR` based transport */
export declare class XHRTransport extends BaseTransport {
    /**
     * @inheritDoc
     */
    captureEvent(event: SentryEvent): Promise<SentryResponse>;
}
