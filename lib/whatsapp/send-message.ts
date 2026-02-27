/**
 * WhatsApp Cloud API - Send message
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_VERSION = "v18.0"
const BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`

export interface SendTextResult {
	success: boolean
	messageId?: string
	error?: string
}

/**
 * Send a text message via WhatsApp Cloud API.
 * Note: Text messages can only be sent within 24h of customer's last message.
 * For appointment reminders (business-initiated), use sendTemplateMessage instead.
 */
export async function sendTextMessage(
	phoneNumberId: string,
	accessToken: string,
	to: string,
	body: string
): Promise<SendTextResult> {
	const normalizedTo = to.replace(/\D/g, "")
	if (!normalizedTo) {
		return { success: false, error: "Invalid phone number" }
	}

	const url = `${BASE_URL}/${phoneNumberId}/messages`
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: normalizedTo,
			type: "text",
			text: { body },
		}),
	})

	const data = await res.json().catch(() => ({}))
	if (!res.ok) {
		const errMsg = data?.error?.message || data?.error?.error_user_msg || res.statusText
		return { success: false, error: errMsg }
	}
	return {
		success: true,
		messageId: data?.messages?.[0]?.id,
	}
}

/**
 * Send a template message. Required for business-initiated conversations
 * (when customer hasn't messaged in 24h). Create template in Meta Business Manager.
 *
 * Example template "appointment_reminder" with body:
 * "Hello! This is a reminder that {{1}} has an appointment tomorrow at {{2}}. See you soon!"
 */
export async function sendTemplateMessage(
	phoneNumberId: string,
	accessToken: string,
	to: string,
	templateName: string,
	languageCode: string,
	components?: Array<{
		type: "body" | "header" | "button"
		parameters: Array<{ type: "text"; text: string }>
	}>
): Promise<SendTextResult> {
	const normalizedTo = to.replace(/\D/g, "")
	if (!normalizedTo) {
		return { success: false, error: "Invalid phone number" }
	}

	const template: Record<string, unknown> = {
		name: templateName,
		language: { code: languageCode },
	}
	if (components && components.length > 0) {
		template.components = components
	}

	const url = `${BASE_URL}/${phoneNumberId}/messages`
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: normalizedTo,
			type: "template",
			template,
		}),
	})

	const data = await res.json().catch(() => ({}))
	if (!res.ok) {
		const errMsg = data?.error?.message || data?.error?.error_user_msg || res.statusText
		return { success: false, error: errMsg }
	}
	return {
		success: true,
		messageId: data?.messages?.[0]?.id,
	}
}
