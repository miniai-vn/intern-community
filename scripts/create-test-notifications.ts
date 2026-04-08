import { db } from "@/lib/db";

/**
 * Test script to create sample notifications
 * Run: npx tsx scripts/create-test-notifications.ts
 */
async function createTestNotifications() {
  try {
    // Get first two users from DB
    const users = await db.user.findMany({ take: 2 });
    if (users.length < 2) {
      console.log("❌ Need at least 2 users. Run seed first: pnpm exec prisma db seed");
      return;
    }

    const [admin, contributor] = users;

    // Get first module
    const module = await db.miniApp.findFirst();
    if (!module) {
      console.log("❌ No modules found");
      return;
    }

    // Create sample notifications
    const notif1 = await db.notification.create({
      data: {
        recipientId: contributor.id,
        moduleId: module.id,
        type: "APPROVED",
      },
    });

    const notif2 = await db.notification.create({
      data: {
        recipientId: contributor.id,
        moduleId: module.id,
        type: "REJECTED",
        isRead: true, // Mark second one as read
      },
    });

    console.log("✅ Test notifications created");
    console.log(`   - APPROVED notification for ${contributor.name}`);
    console.log(`   - REJECTED notification (marked as read)`);
    console.log(`\n👤 Login as: ${contributor.email || contributor.name}`);
    console.log(`   to see notifications in navbar bell icon`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

createTestNotifications();
