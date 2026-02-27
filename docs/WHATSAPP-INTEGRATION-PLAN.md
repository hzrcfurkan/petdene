# WhatsApp Integration – Technical Plan

## Overview

This document outlines the technical plan for integrating WhatsApp Business API with the Pet Care system for automated reminders, confirmations, and notifications.

---

## 1. WhatsApp Business API Requirements

### Prerequisites
- **Meta Business Account** – Required for WhatsApp Business API
- **WhatsApp Business API Access** – Via Meta’s official providers:
  - **Meta (Direct)** – [business.facebook.com](https://business.facebook.com)
  - **Twilio** – [twilio.com/whatsapp](https://www.twilio.com/whatsapp)
  - **MessageBird** – [messagebird.com](https://messagebird.com)
  - **360dialog** – [360dialog.com](https://www.360dialog.com) (popular for EU/Turkey)

### Environment Variables
```env
WHATSAPP_ACCESS_TOKEN=        # From Meta Developer Console
WHATSAPP_PHONE_NUMBER_ID=     # Your WhatsApp Business phone number ID
WHATSAPP_BUSINESS_ACCOUNT_ID= # Optional, for analytics
```

### Phone Number Format
- Use E.164 format: `+905551234567` (Turkey)
- No spaces, dashes, or parentheses

---

## 2. Message Types & Use Cases

### 2.1 Appointment Confirmations
**Trigger:** When staff/admin confirms an appointment  
**Content:** Confirmation with date, time, service, and clinic details  
**Template:** Pre-approved or session message

### 2.2 Appointment Reminders
**Trigger:** 24 hours before appointment (cron job)  
**Content:** Reminder with pet name, date, time, service  
**Implementation:** Existing `/api/cron/whatsapp-reminders` – extend as needed

### 2.3 Payment Reminders
**Trigger:** When visit has outstanding balance (configurable: 3 days, 7 days)  
**Content:** Balance amount, protocol number, payment options  
**New:** Cron job or background job

### 2.4 Vaccination Reminders
**Trigger:** When vaccination `nextDue` is within 7 days  
**Content:** Pet name, vaccine, due date, clinic contact  
**New:** Cron job querying Vaccination model

### 2.5 Visit/Checkup Follow-ups
**Trigger:** Optional – X days after visit  
**Content:** Follow-up message, request feedback  
**New:** Optional feature

---

## 3. Architecture

### 3.1 Current State
- `lib/whatsapp/send-message.ts` – Sends messages via Meta Graph API
- `app/api/cron/whatsapp-reminders/route.ts` – Sends appointment reminders (tomorrow)
- Cron trigger: Vercel Cron or external scheduler

### 3.2 Proposed Structure

```
lib/whatsapp/
├── send-message.ts       # Core send function (existing)
├── templates.ts         # Message templates
├── reminders/
│   ├── appointments.ts  # Appointment reminders
│   ├── payments.ts      # Payment reminders
│   └── vaccinations.ts  # Vaccination reminders
└── types.ts             # Shared types

app/api/cron/
├── whatsapp-reminders/     # Appointment reminders (existing)
├── whatsapp-payment-reminders/  # New
└── whatsapp-vaccination-reminders/  # New
```

### 3.3 Database Additions (Optional)

```prisma
model NotificationLog {
  id          String   @id @default(uuid())
  userId      String?
  petId       String?
  visitId     String?
  type        String   // APPOINTMENT_REMINDER, PAYMENT_REMINDER, VACCINATION_REMINDER
  channel     String   // WHATSAPP, EMAIL
  phone       String?
  sentAt      DateTime @default(now())
  status      String   // SENT, FAILED
  errorMessage String?
  
  user  User?  @relation(...)
  pet   Pet?   @relation(...)
  visit Visit? @relation(...)
}
```

---

## 4. Implementation Phases

### Phase 1: Appointment Reminders (Existing – Enhance)
- [x] Cron job for tomorrow’s appointments
- [ ] Add configurable time (e.g. 24h before)
- [ ] Add opt-out preference per user
- [ ] Log sent messages

### Phase 2: Appointment Confirmations
- [ ] Trigger on appointment status → CONFIRMED
- [ ] Send confirmation template
- [ ] Include “Reply to confirm” or link

### Phase 3: Payment Reminders
- [ ] New cron: `whatsapp-payment-reminders`
- [ ] Query visits with `balance > 0` and `visitDate` within last N days
- [ ] Send to `pet.owner.phone` if valid
- [ ] Throttle: max 1 reminder per visit per 7 days

### Phase 4: Vaccination Reminders
- [ ] New cron: `whatsapp-vaccination-reminders`
- [ ] Query Vaccination where `nextDue` in next 7 days
- [ ] Send to `pet.owner.phone`
- [ ] Include vaccine name and due date

### Phase 5: Opt-in / Opt-out
- [ ] Add `whatsappOptIn` (or `notificationsEnabled`) to User
- [ ] Settings page for customers to toggle
- [ ] Respect opt-out in all reminder jobs

---

## 5. Message Templates (WhatsApp Policy)

WhatsApp requires **pre-approved templates** for proactive messages.  
Create templates in Meta Business Manager → WhatsApp → Message Templates.

### Example Templates

**Appointment Reminder:**
```
Reminder: {{1}} has an appointment on {{2}} at {{3}}. Service: {{4}}. Reply to confirm or cancel.
```

**Payment Reminder:**
```
Hello {{1}}, your visit PRO-{{2}} has an outstanding balance of {{3}}. Please visit the clinic or contact us to settle.
```

**Vaccination Reminder:**
```
Reminder: {{1}}'s {{2}} vaccination is due on {{3}}. Please book an appointment.
```

---

## 6. Cron Configuration

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/whatsapp-reminders",
      "schedule": "0 18 * * *"
    },
    {
      "path": "/api/cron/whatsapp-payment-reminders",
      "schedule": "0 10 * * 1"
    },
    {
      "path": "/api/cron/whatsapp-vaccination-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

- Appointment reminders: daily at 18:00 (6 PM)
- Payment reminders: Mondays at 10:00
- Vaccination reminders: daily at 9:00

---

## 7. Error Handling & Monitoring

- Log all send attempts (success/failure)
- Retry failed sends (exponential backoff, max 3)
- Alert on high failure rate
- Respect WhatsApp rate limits (80 msg/sec for Cloud API)

---

## 8. Cost Considerations

- **WhatsApp Business API:** Per-conversation pricing (varies by country)
- **Turkey:** Check Meta’s pricing page for current rates
- **Template messages:** Typically cheaper than session messages
- **Free tier:** 1,000 conversations/month (verify current policy)

---

## 9. Security

- Store `WHATSAPP_ACCESS_TOKEN` in env (never in code)
- Use Vercel Cron secret for cron routes: `CRON_SECRET`
- Validate webhook signatures if using inbound webhooks
- Do not log phone numbers in production

---

## 10. Next Steps

1. Apply for WhatsApp Business API access (if not done)
2. Create message templates in Meta Business Manager
3. Implement Phase 2 (Appointment Confirmations)
4. Implement Phase 3 (Payment Reminders)
5. Implement Phase 4 (Vaccination Reminders)
6. Add user opt-in/opt-out (Phase 5)
7. Set up monitoring and alerts
