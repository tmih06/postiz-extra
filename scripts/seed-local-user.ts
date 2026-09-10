/**
 * @file Local development database seed script.
 *
 * Idempotently provisions a default activated test user (`dev@example.com`) and default organization
 * (`Local Development`) in the isolated local Docker PostgreSQL database.
 *
 * Safety guarantees:
 * - Refuses execution if `NODE_ENV === 'production'`.
 * - Refuses execution if `DATABASE_URL` points to anything other than the isolated local Docker
 *   database on `127.0.0.1:15432` / `localhost:15432` with database `postiz-db-local`.
 */
import { Provider } from '@prisma/client';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { OrganizationRepository } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository';
import {
  PrismaRepository,
  PrismaService,
} from '@gitroom/nestjs-libraries/database/prisma/prisma.service';

/** Default email address for local development login. */
const email = 'dev@example.com';
/** Default plaintext password for local development login. */
const password = 'PostizLocal123!';

/**
 * Main execution entry point for local user and organization database seeding.
 *
 * Connects to PostgreSQL via Prisma, performs strict safety checks on connection parameters,
 * verifies whether the test user exists (verifying password hash and active status if present),
 * or creates a new organization and user with bcrypt-hashed credentials if absent.
 *
 * @throws {Error} When executed against a non-local database, production environment, or if
 *                 the test email is occupied by an incompatible/deleted/inactive account.
 * @returns A promise resolving upon successful seed verification and Prisma disconnect.
 */
async function main() {
  const database = new URL(process.env.DATABASE_URL || '');
  // Public test credentials must only reach the isolated Docker development DB.
  if (
    process.env.NODE_ENV === 'production' ||
    database.protocol !== 'postgresql:' ||
    !['127.0.0.1', 'localhost'].includes(database.hostname) ||
    database.port !== '15432' ||
    database.pathname !== '/postiz-db-local' ||
    database.username !== 'postiz-local' ||
    database.search ||
    database.hash
  ) {
    throw new Error(
      'Refusing to seed outside the isolated local development database.'
    );
  }

  const prisma = new PrismaService();
  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      if (
        existing.providerName !== Provider.LOCAL ||
        existing.deletedAt ||
        !existing.activated ||
        !existing.password ||
        !AuthService.comparePassword(password, existing.password)
      ) {
        throw new Error(
          'The test email is already in use by a different or inactive account; nothing changed.'
        );
      }
      console.log('Local test account already exists; nothing changed.');
    } else {
      const organizations = new OrganizationRepository(
        new PrismaRepository<'organization'>(prisma),
        new PrismaRepository<'userOrganization'>(prisma),
        new PrismaRepository<'user'>(prisma)
      );
      await organizations.createOrgAndUser(
        {
          company: 'Local Development',
          email,
          password,
          provider: Provider.LOCAL,
          datafast_visitor_id: '',
        },
        false,
        '127.0.0.1',
        'local-development-seed'
      );
      console.log('Created activated local test account and organization.');
    }
    console.log(`Local development only: ${email} / ${password}`);
    console.log('Sign in at http://localhost:4200');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
