import { SentryEvent, SentryResponse, Transport, TransportOptions } from '@sentry/types';
/** Base Transport class implementation */
export declare abstract class BaseTransport implements Transport {
    options: TransportOptions;
    /**
     * @inheritDoc
     */
    url: string;
    constructor(options: TransportOptions);
    /**
     * @inheritDoc
     */
    captureEvent(_: SentryEvent): Promise<SentryResponse>;
}
