/**
 * Authentication module exports
 * 
 * Note: Server-only exports (authOptions, getAuthSession, currentUserServer) 
 * are marked with "server-only" in their source files.
 * Client components should import currentUserClient directly.
 */
export { authOptions, getAuthSession } from "./auth"
export { default as currentUserClient } from "./current-user-client"
export { default as currentUserServer } from "./current-user-server"
export * from "./rbac"
