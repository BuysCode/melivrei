BEGIN;

-- Preserve usuários, anúncios, propostas e histórico de negociação.
ALTER TABLE "User" ADD COLUMN "whatsappNumber" TEXT;

-- Uma compra pendente continua reservada e passa a exigir aceite do vendedor.
UPDATE "Negotiation" SET "status" = 'PENDING'
WHERE "status" = 'PENDING_PAYMENT';

ALTER TYPE "NegotiationStatus" RENAME TO "NegotiationStatus_old";
CREATE TYPE "NegotiationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');
ALTER TABLE "Negotiation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Negotiation" ALTER COLUMN "status" TYPE "NegotiationStatus"
USING ("status"::text::"NegotiationStatus");
ALTER TABLE "Negotiation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "NegotiationStatus_old";

-- Somente estruturas da integração de pagamento são eliminadas.
DELETE FROM "AuditEvent" WHERE "entityType" IN ('Payment', 'PaymentEvent', 'SellerPaymentAccount', 'MercadoPagoOAuthState');
DROP TABLE "PaymentEvent";
DROP TABLE "Payment";
DROP TABLE "SellerPaymentAccount";
DROP TABLE "MercadoPagoOAuthState";
DROP TYPE "PaymentStatus";

COMMIT;
