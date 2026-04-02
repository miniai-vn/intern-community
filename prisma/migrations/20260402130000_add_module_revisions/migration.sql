-- CreateTable
CREATE TABLE "module_revisions" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "demoUrl" TEXT,
    "status" "SubmissionStatus" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "module_revisions_moduleId_createdAt_idx" ON "module_revisions"("moduleId", "createdAt");

-- AddForeignKey
ALTER TABLE "module_revisions" ADD CONSTRAINT "module_revisions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "mini_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_revisions" ADD CONSTRAINT "module_revisions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
