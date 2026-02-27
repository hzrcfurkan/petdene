-- AlterTable: Make appointmentId optional and add visitId for protocol-based invoices
ALTER TABLE "Invoice" ALTER COLUMN "appointmentId" DROP NOT NULL;

-- Drop the old unique constraint on appointmentId
DROP INDEX IF EXISTS "Invoice_appointmentId_key";

-- Add visitId column
ALTER TABLE "Invoice" ADD COLUMN "visitId" TEXT;

-- Create unique index on visitId (allows one invoice per visit)
CREATE UNIQUE INDEX "Invoice_visitId_key" ON "Invoice"("visitId");

-- Recreate unique index on appointmentId (PostgreSQL allows multiple NULLs in unique columns)
CREATE UNIQUE INDEX "Invoice_appointmentId_key" ON "Invoice"("appointmentId");

-- Add foreign key to Visit
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
