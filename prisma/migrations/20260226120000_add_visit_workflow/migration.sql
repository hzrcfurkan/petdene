-- Add patientNumber to Pet (backfill existing, then add constraint)
ALTER TABLE "Pet" ADD COLUMN "patientNumber" TEXT;

-- Backfill patientNumber for existing pets
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") as rn FROM "Pet"
)
UPDATE "Pet" p SET "patientNumber" = 'PAT-' || LPAD(n.rn::TEXT, 6, '0')
FROM numbered n WHERE p.id = n.id;

ALTER TABLE "Pet" ALTER COLUMN "patientNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Pet_patientNumber_key" ON "Pet"("patientNumber");

-- Create Visit table
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "protocolNumber" INTEGER NOT NULL,
    "petId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "staffId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- Create VisitService table
CREATE TABLE "VisitService" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitService_pkey" PRIMARY KEY ("id")
);

-- Create VisitPayment table
CREATE TABLE "VisitPayment" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeClientSecret" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visit_protocolNumber_key" ON "Visit"("protocolNumber");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VisitService" ADD CONSTRAINT "VisitService_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitService" ADD CONSTRAINT "VisitService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "PetService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "VisitPayment" ADD CONSTRAINT "VisitPayment_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alter MedicalRecord
ALTER TABLE "MedicalRecord" ADD COLUMN IF NOT EXISTS "visitId" TEXT;
ALTER TABLE "MedicalRecord" ADD COLUMN IF NOT EXISTS "complaints" TEXT;
ALTER TABLE "MedicalRecord" ADD COLUMN IF NOT EXISTS "examinationNotes" TEXT;
ALTER TABLE "MedicalRecord" ADD COLUMN IF NOT EXISTS "treatmentsPerformed" TEXT;
ALTER TABLE "MedicalRecord" ADD COLUMN IF NOT EXISTS "recommendations" TEXT;

ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "MedicalRecord_visitId_key" ON "MedicalRecord"("visitId");
