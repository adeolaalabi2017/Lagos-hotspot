import { db } from "../src/lib/db";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }
  const target = await db.user.findUnique({ where: { email } });
  if (!target) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }
  if (target.role === "admin") {
    console.log(`Already admin: ${email}`);
    process.exit(0);
  }
  await db.user.update({
    where: { email },
    data: { role: "admin" },
  });
  console.log(`Promoted ${email} to admin`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
