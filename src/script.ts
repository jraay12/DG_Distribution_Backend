import { prisma } from "./config/prisma";

async function main() {
 await prisma.user.create({
    data: {
      name: "ADMIN",
      password: "admin123",
      email: "admin@example.com",
      role:"ADMIN",
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });