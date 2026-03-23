import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const baseClient = new PrismaClient({ adapter })

const prisma = baseClient.$extends({
  query: {
    $allModels: {
      async delete<T, A>({
        args,
        model,
      }: {
        args: Prisma.Args<T, 'delete'>;
        model: string;
        query: (args: Prisma.Args<T, 'delete'>) => Promise<Prisma.Result<T, A, 'delete'>>;
      }) {
        return (baseClient[model as keyof typeof baseClient] as any).update({
          where: (args as any).where,
          data: { deletedAt: new Date() },
        });
      },
    },
  },
});

export type ExtendedPrismaClient = typeof prisma;
export { prisma };
