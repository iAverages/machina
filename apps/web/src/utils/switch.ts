/**
 * A utility function that ensures exhaustive handling in switch statements and conditional logic.
 *
 * This function is designed to be called in the default case of a switch statement or the final
 * else clause of conditional logic. When TypeScript's strict checking is enabled, this function
 * will cause a compile-time error if not all possible cases have been handled, as the parameter
 * will not be assignable to `never`.
 *
 * @param _ - Should be `never` type when all cases are properly handled. If TypeScript can
 *           reach this function call, it indicates missing case handling and will cause a
 *           compile-time error.
 * @param error - Optional custom error message. If not provided, defaults to "unreachable".
 *
 * @throws {Error} Always throws an error if reached at runtime, indicating a logic error
 *                 or incomplete case handling.
 *
 * @returns Never returns - function always throws
 *
 * @example
 * ```typescript
 * type Status = 'loading' | 'success' | 'error';
 *
 * function handleStatus(status: Status) {
 *   switch (status) {
 *     case 'loading':
 *       return 'Loading...';
 *     case 'success':
 *       return 'Success!';
 *     case 'error':
 *       return 'Error occurred';
 *     default:
 *       // TypeScript error if any Status case is missing above
 *       return unreachable(status, 'Unhandled status type');
 *   }
 * }
 * ```
 */
export const unreachable = (_: never, error?: string): never => {
    throw new Error(`fatal: ${error ?? "unreachable"}`);
};
