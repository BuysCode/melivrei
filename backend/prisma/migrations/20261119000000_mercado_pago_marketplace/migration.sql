ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'IN_DISPUTE';

ALTER TABLE "Payment"
  ALTER COLUMN "providerPaymentId" DROP NOT NULL,
  ADD COLUMN "providerPreferenceId" TEXT,
  ADD COLUMN "checkoutUrl" TEXT,
  ADD COLUMN "marketplaceFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ADD COLUMN "providerStatus" TEXT,
  ADD COLUMN "providerUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "paymentMethodId" TEXT;

CREATE UNIQUE INDEX "Payment_providerPreferenceId_key" ON "Payment"("providerPreferenceId");

CREATE TABLE "SellerPaymentAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "providerUserId" TEXT NOT NULL,
  "accessTokenEncrypted" TEXT NOT NULL,
  "refreshTokenEncrypted" TEXT NOT NULL,
  "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
  "publicKey" TEXT,
  "scope" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SellerPaymentAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SellerPaymentAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SellerPaymentAccount_userId_key" ON "SellerPaymentAccount"("userId");
CREATE UNIQUE INDEX "SellerPaymentAccount_providerUserId_key" ON "SellerPaymentAccount"("providerUserId");

CREATE TABLE "MercadoPagoOAuthState" (
  "id" TEXT NOT NULL,
  "stateHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MercadoPagoOAuthState_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MercadoPagoOAuthState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MercadoPagoOAuthState_stateHash_key" ON "MercadoPagoOAuthState"("stateHash");
CREATE INDEX "MercadoPagoOAuthState_userId_expiresAt_idx" ON "MercadoPagoOAuthState"("userId", "expiresAt");
