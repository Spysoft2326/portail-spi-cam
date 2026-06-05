const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('=== DIAGNOSTIC PRISMA CLIENT ===');
console.log('Type de prisma.enterprise:', typeof prisma.enterprise);
console.log('');

const models = Object.keys(prisma).filter(k => 
  typeof prisma[k] === 'object' && prisma[k] !== null && 
  (prisma[k].findUnique || prisma[k].findMany || prisma[k].upsert)
);

console.log('Modèles disponibles:', models);
console.log('');

if (prisma.enterprise) {
  console.log('✅ prisma.enterprise EXISTE !');
  console.log('Méthodes upsert?', typeof prisma.enterprise.upsert);
} else {
  console.log('❌ prisma.enterprise N\'EXISTE PAS');
  console.log('Vérifiez que le modèle Enterprise est dans schema.prisma');
}

prisma.();
