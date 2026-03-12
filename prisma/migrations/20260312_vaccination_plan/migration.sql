-- AlterTable: Vaccination - yeni alanlar ekle
ALTER TABLE "Vaccination" ADD COLUMN IF NOT EXISTS "dateGiven_new" TIMESTAMP(3);
-- dateGiven'i nullable yap (önce kopyala, sonra düşür)
ALTER TABLE "Vaccination" ALTER COLUMN "dateGiven" DROP NOT NULL;

ALTER TABLE "Vaccination" 
  ADD COLUMN IF NOT EXISTS "isPlanned"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "scheduledTime" TEXT,
  ADD COLUMN IF NOT EXISTS "stockItemId"   TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Foreign key: stockItemId → StockItem
ALTER TABLE "Vaccination" 
  ADD CONSTRAINT "Vaccination_stockItemId_fkey" 
  FOREIGN KEY ("stockItemId") 
  REFERENCES "StockItem"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
