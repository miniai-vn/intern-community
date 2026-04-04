-- CreateIndex
CREATE INDEX "mini_apps_status_createdAt_authorId_idx" ON "mini_apps"("status", "createdAt", "authorId");
