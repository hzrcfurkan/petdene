/**
 * Authentication module exports
 * 
 * Note: Server-only exports (authOptions, getAuthSession, currentUserServer) 
 * should only be used in server components and API routes.
 * Client components should import currentUserClient directly.
 */
export { authOptions, getAuthSession } from "./auth"
export { default as currentUserClient } from "./current-user-client"
export { default as currentUserServer } from "./current-user-server"
export * from "./rbac"
