-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "accessKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "projectId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" JSONB NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" JSONB,
    "metadata" JSONB,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
