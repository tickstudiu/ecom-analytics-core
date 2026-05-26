/**
 * @deprecated ga.js — Universal Analytics (UA) builder
 *
 * Universal Analytics was sunset by Google on 1 July 2023.
 * This file is kept as a tombstone only. All methods have been migrated
 * to createGa4Builders in ga4.js with clean GA4 named parameters.
 *
 * Migration: replace createGaBuilders(...) with createGa4Builders(...)
 * in your analytics plugin. All method names are preserved.
 *
 * This file will be deleted in the next major version (v3.0.0).
 */

export const gaWrapper = () => {
	if (process.env.NODE_ENV !== 'production') {
		console.warn('[ecom-analytics-core] gaWrapper is deprecated and will be removed in v3.0.0. UA tracking no longer works.');
	}
};

export const createGaBuilders = () => {
	if (process.env.NODE_ENV !== 'production') {
		console.warn('[ecom-analytics-core] createGaBuilders is deprecated and will be removed in v3.0.0. Migrate to createGa4Builders — all method names are preserved.');
	}
	return {};
};

export default {};
