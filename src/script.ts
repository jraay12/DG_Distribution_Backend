import { prisma } from "./config/prisma";
import { Bcrypt } from "./utils/bcrypt";
async function main() {

  const bcrypt = new Bcrypt()
  const hashedPassword = await bcrypt.hash("admin123")
 await prisma.user.create({
    data: {
      name: "ADMIN",
      password: hashedPassword,
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