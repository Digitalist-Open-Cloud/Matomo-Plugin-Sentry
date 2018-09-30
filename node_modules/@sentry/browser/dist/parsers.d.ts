import { SentryEvent, SentryException, StackFrame } from '@sentry/types';
import { StackFrame as TraceKitStackFrame, StackTrace as TraceKitStackTrace } from './tracekit';
/** JSDoc */
export declare function exceptionFromStacktrace(stacktrace: TraceKitStackTrace): SentryException;
/** JSDoc */
export declare function eventFromPlainObject(exception: {}, syntheticException: Error | null): SentryEvent;
/** JSDoc */
export declare function eventFromStacktrace(stacktrace: TraceKitStackTrace): SentryEvent;
/** JSDoc */
export declare function prepareFramesForEvent(stack: TraceKitStackFrame[]): StackFrame[];
