import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    //this.$on('beforeExit') não funciona mais a partir do Prisma 5.
    //Fontes:
    //  https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management
    //  https://github.com/prisma/prisma/issues/20171
    //this.$on('beforeExit', async () => {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
