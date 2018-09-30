import { BaseBackend, Options } from '@sentry/core';
import { SentryEvent, SentryEventHint, SentryResponse, Severity } from '@sentry/types';
/**
 * Configuration options for the Sentry Browser SDK.
 * @see BrowserClient for more information.
 */
export interface BrowserOptions extends Options {
    /**
     * A pattern for error URLs which should not be sent to Sentry.
     * To whitelist certain errors instead, use {@link Options.whitelistUrls}.
     * By default, all errors will be sent.
     */
    blacklistUrls?: Array<string | RegExp>;
    /**
     * A pattern for error URLs which should exclusively be sent to Sentry.
     * This is the opposite of {@link Options.blacklistUrls}.
     * By default, all errors will be sent.
     */
    whitelistUrls?: Array<string | RegExp>;
}
/** The Sentry Browser SDK Backend. */
export declare class BrowserBackend extends BaseBackend<BrowserOptions> {
    /**
     * @inheritDoc
     */
    install(): boolean;
    /**
     * @inheritDoc
     */
    eventFromException(exception: any, hint?: SentryEventHint): Promise<SentryEvent>;
    /**
     * @inheritDoc
     */
    eventFromMessage(message: string, level?: Severity, hint?: SentryEventHint): Promise<SentryEvent>;
    /**
     * @inheritDoc
     */
    sendEvent(event: SentryEvent): Promise<SentryResponse>;
}
