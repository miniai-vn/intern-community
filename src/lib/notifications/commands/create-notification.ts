// ── Command: CreateNotification ─────────────────────────────────────────────
// Called by the admin review handler after a status change.
// Inserts a new notification row for the module author.

import { db } from "@/lib/db";
import { toNotificationType, formatNotificationMessage } from "../domain/notification";

export interface CreateNotificationCommand {
    moduleId: string;
    moduleName: string;
    authorId: string;
    /** Only APPROVED | REJECTED trigger a notification */
    status: "APPROVED" | "REJECTED";
}

export async function handleCreateNotification(
    cmd: CreateNotificationCommand,
): Promise<void> {
    const type = toNotificationType(cmd.status);
    const message = formatNotificationMessage(type, cmd.moduleName);

    await db.notification.create({
        data: {
            userId: cmd.authorId,
            moduleId: cmd.moduleId,
            type,
            message,
        },
    });
}
