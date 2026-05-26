/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	testMatch: [
		'**/tests/**/*.test.js',
	],
	collectCoverageFrom: [
		'helpers/**/*.js',
		'resolvers/**/*.js',
		'gtm.js',
		'ga4.js',
		'!ga.js',        // deprecated stub — not worth covering
	],
	coverageThreshold: {
		// Resolvers and helpers are pure data-transformation — hold them to a high bar
		'./helpers/consent.js':   { lines: 95, functions: 100, branches: 80 },
		'./helpers/numeral.js':   { lines: 80, functions: 80,  branches: 70 },
		'./helpers/ga.js':        { lines: 80, functions: 60,  branches: 60 },
		'./helpers/route.js':     { lines: 100, functions: 100, branches: 100 },
		'./resolvers/customer.js':{ lines: 100, functions: 100, branches: 100 },
		'./resolvers/order.js':   { lines: 95,  functions: 100, branches: 90  },
		// Builder files contain many repetitive event methods (~130 in ga4.js).
		// Integration tests cover the patterns; threshold is intentionally lower.
		'./gtm.js': { lines: 30, functions: 30, branches: 20 },
		'./ga4.js': { lines: 8,  functions: 5,  branches: 5  },
	},
};
