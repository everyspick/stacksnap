/**
 * Notifier module for stacksnap.
 * Provides utilities for broadcasting change notifications across supported channels.
 */
export { notifyChange, buildPayload } from './notifyChange';
export type { NotifyChannel, NotifyOptions, NotifyPayload } from './notifyChange';
