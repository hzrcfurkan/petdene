-- VetOrder tablosu
CREATE TABLE IF NOT EXISTS "VetOrder" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "visitId"        TEXT NOT NULL,
    "petId"          TEXT NOT NULL,
    "orderedById"    TEXT NOT NULL,
    "assignedToId"   TEXT,
    "type"           TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "stockItemId"    TEXT,
    "dose"           TEXT,
    "route"          TEXT,
    "frequency"      TEXT,
    "duration"       TEXT,
    "scheduledAt"    TIMESTAMP(3),
    "priority"       TEXT NOT NULL DEFAULT 'NORMAL',
    "status"         TEXT NOT NULL DEFAULT 'PENDING',
    "chargeToVisit"  BOOLEAN NOT NULL DEFAULT true,
    "unitPrice"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VetOrder_visitId_fkey"     FOREIGN KEY ("visitId")     REFERENCES "Visit"("id")      ON DELETE CASCADE,
    CONSTRAINT "VetOrder_petId_fkey"       FOREIGN KEY ("petId")       REFERENCES "Pet"("id")        ON DELETE CASCADE,
    CONSTRAINT "VetOrder_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "User"("id"),
    CONSTRAINT "VetOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id"),
    CONSTRAINT "VetOrder_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE SET NULL
);

-- VetOrderLog tablosu
CREATE TABLE IF NOT EXISTS "VetOrderLog" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "orderId"   TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VetOrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "VetOrder"("id") ON DELETE CASCADE,
    CONSTRAINT "VetOrderLog_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"("id")
);

-- İndeksler
CREATE INDEX IF NOT EXISTS "VetOrder_visitId_idx"   ON "VetOrder"("visitId");
CREATE INDEX IF NOT EXISTS "VetOrder_petId_idx"     ON "VetOrder"("petId");
CREATE INDEX IF NOT EXISTS "VetOrder_status_idx"    ON "VetOrder"("status");
CREATE INDEX IF NOT EXISTS "VetOrder_priority_idx"  ON "VetOrder"("priority");
CREATE INDEX IF NOT EXISTS "VetOrderLog_orderId_idx" ON "VetOrderLog"("orderId");
