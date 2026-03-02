-- CreateTable: StockItem
CREATE TABLE "StockItem" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "category"    TEXT NOT NULL DEFAULT 'İlaç',
    "unit"        TEXT NOT NULL DEFAULT 'Adet',
    "quantity"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minQuantity" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "price"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPrice"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "barcode"     TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: VisitStockUsage
CREATE TABLE "VisitStockUsage" (
    "id"          TEXT NOT NULL,
    "visitId"     TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "quantity"    DOUBLE PRECISION NOT NULL,
    "unitPrice"   DOUBLE PRECISION NOT NULL,
    "total"       DOUBLE PRECISION NOT NULL,
    "notes"       TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitStockUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VisitStockUsage" ADD CONSTRAINT "VisitStockUsage_visitId_fkey"
    FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VisitStockUsage" ADD CONSTRAINT "VisitStockUsage_stockItemId_fkey"
    FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
