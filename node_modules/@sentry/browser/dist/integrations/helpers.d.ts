import { Mechanism, SentryWrappedFunction } from '@sentry/types';
/** JSDoc */
export declare function shouldIgnoreOnError(): boolean;
/** JSDoc */
export declare function ignoreNextOnError(): void;
/**
 * Instruments the given function and sends an event to Sentry every time the
 * function throws an exception.
 *
 * @param fn A function to wrap.
 * @returns The wrapped function.
 */
export declare function wrap(fn: SentryWrappedFunction, options?: {
    mechanism?: Mechanism;
}, before?: SentryWrappedFunction): any;
/**
 * Wraps addEventListener to capture UI breadcrumbs
 * @param eventName the event name (e.g. "click")
 * @returns wrapped breadcrumb events handler
 */
export declare function breadcrumbEventHandler(eventName: string): (event: Event) => void;
/**
 * Wraps addEventListener to capture keypress UI events
 * @returns wrapped keypress events handler
 */
export declare function keypressEventHandler(): (event: Event) => void;
