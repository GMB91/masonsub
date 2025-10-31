/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

// Provide vitest globals (describe/test/vi/expect) to the TypeScript
// language service and compiler so test files typecheck correctly.
// Fallback ambient declarations — some TypeScript setups don't pick up the
// shipped vitest globals types, so provide lightweight any-based
// declarations to ensure the compiler accepts test files.
declare const vi: any
declare function describe(name: string, fn: (...args: any[]) => any): any
declare function it(name: string, fn: (...args: any[]) => any): any
declare function test(name: string, fn: (...args: any[]) => any): any
declare function beforeEach(fn: (...args: any[]) => any): any
declare function afterEach(fn: (...args: any[]) => any): any
declare const expect: any
