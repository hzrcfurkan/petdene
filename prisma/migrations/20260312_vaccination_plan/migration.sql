-- Step 1: dateGiven nullable yap
ALTER TABLE "Vaccination" ALTER COLUMN "dateGiven" DROP NOT NULL;

-- Step 2: Yeni kolonları ekle (IF NOT EXISTS - güvenli, tekrar çalıştırılabilir)
ALTER TABLE "Vaccination"
  ADD COLUMN IF NOT EXISTS "isPlanned"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "scheduledTime" TEXT,
  ADD COLUMN IF NOT EXISTS "stockItemId"   TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 3: FK sadece yoksa ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Vaccination_stockItemId_fkey'
      AND table_name = 'Vaccination'
  ) THEN
    ALTER TABLE "Vaccination"
      ADD CONSTRAINT "Vaccination_stockItemId_fkey"
      FOREIGN KEY ("stockItemId")
      REFERENCES "StockItem"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Step 4: Mevcut kayıtlarda dateGiven null değilse isPlanned=false (zaten default)
-- Gelecek tarihli kayıtları otomatik planlama olarak işaretle
UPDATE "Vaccination"
SET "isPlanned" = true
WHERE "dateGiven" > NOW()
  AND "isPlanned" = false;
