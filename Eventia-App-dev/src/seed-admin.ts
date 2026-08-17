import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Role } from './common/role.enum';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const existing = await userRepo.findOne({ where: { email: 'admin@eventia.com' } });
  if (existing) {
    console.log('Admin already exists:', existing.id);
    await app.close();
    return;
  }

  const hashed = await bcrypt.hash('Admin@1234', 10);
  const admin = userRepo.create({
    email: 'admin@eventia.com',
    password: hashed,
    firstName: 'Super',
    lastName: 'Admin',
    role: Role.ADMIN,
    isActive: true,
  });
  const saved = await userRepo.save(admin);
  console.log('Admin created:', saved.id, saved.email);
  await app.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
