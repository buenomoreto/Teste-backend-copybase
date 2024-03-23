-- CreateTable
CREATE TABLE "Billing" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "chargedIntervalDays" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "statusDate" TIMESTAMP(3),
    "cancellationDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "nextCycle" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);
