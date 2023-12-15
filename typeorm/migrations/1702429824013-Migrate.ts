import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migrate1702429824013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true, //Não aceitar números negativos.
          },
          {
            name: 'name',
            type: 'varchar',
            length: '63',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '127',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '127',
          },
          {
            name: 'birthAt',
            type: 'date',
            isNullable: true, //Quando não especificado, o default é false.
          },
          {
            name: 'role',
            type: 'int',
            default: '2',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
