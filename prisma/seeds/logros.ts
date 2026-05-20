import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma";
import { LOGROS_CATALOG } from "../../src/lib/logros-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Sembrando ${LOGROS_CATALOG.length} logros...`);
  for (const l of LOGROS_CATALOG) {
    await prisma.logro.upsert({
      where: { codigo: l.codigo },
      update: {
        nombre: l.nombre,
        descripcion: l.descripcion,
        icono: l.icono,
        xpRecompensa: l.xpRecompensa,
      },
      create: {
        codigo: l.codigo,
        nombre: l.nombre,
        descripcion: l.descripcion,
        icono: l.icono,
        xpRecompensa: l.xpRecompensa,
      },
    });
    console.log(`  [${l.codigo}] ${l.nombre} (+${l.xpRecompensa} XP)`);
  }
  const total = await prisma.logro.count();
  console.log(`\nOK - ${total} logros en BD.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
