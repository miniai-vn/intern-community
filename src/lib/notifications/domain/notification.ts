// ── Domain ─────────────────────────────────────────────────────────────────
// Keep this file free of Prisma / Next.js imports.
// It is the single source of truth for what a Notification *means*.

export type NotificationType = "MODULE_APPROVED" | "MODULE_REJECTED";

export interface Notification {
    id: string;
    userId: string;
    moduleId: string;
    moduleName: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: Date;
}

// Value object: the human-readable message derived from type + module name.
// Centralised here so UI and tests share the same wording.
export function formatNotificationMessage(
    type: NotificationType,
    moduleName: string,
): string {
    switch (type) {
        case "MODULE_APPROVED":
            return `"${moduleName}" was approved 🎉`;
        case "MODULE_REJECTED":
            return `"${moduleName}" was rejected`;
    }
}

// Guard: only these status strings can produce a notification.
export function isNotifiableStatus(status: string): status is NotificationType {
    return status === "MODULE_APPROVED" || status === "MODULE_REJECTED";
}

// Map Prisma SubmissionStatus → NotificationType
export function toNotificationType(
    status: "APPROVED" | "REJECTED",
): NotificationType {
    return status === "APPROVED" ? "MODULE_APPROVED" : "MODULE_REJECTED";
}
