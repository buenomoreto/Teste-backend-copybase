-- CreateTable
CREATE TABLE "Billing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantity" INTEGER NOT NULL,
    "chargedIntervalDays" INTEGER NOT NULL,
    "start" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "statusDate" DATETIME,
    "cancellationDate" DATETIME,
    "amount" REAL NOT NULL,
    "nextCycle" DATETIME NOT NULL,
    "userId" TEXT NOT NULL
);
