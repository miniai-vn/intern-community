-- CreateIndex
CREATE INDEX "mini_apps_status_updatedAt_authorId_idx" ON "mini_apps"("status", "updatedAt", "authorId");
