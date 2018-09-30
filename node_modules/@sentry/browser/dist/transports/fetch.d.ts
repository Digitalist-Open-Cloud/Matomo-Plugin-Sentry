import { SentryEvent, SentryResponse } from '@sentry/types';
import { BaseTransport } from './base';
/** `fetch` based transport */
export declare class FetchTransport extends BaseTransport {
    /**
     * @inheritDoc
     */
    captureEvent(event: SentryEvent): Promise<SentryResponse>;
}
