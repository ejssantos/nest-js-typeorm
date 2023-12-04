import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  //data: CreateUserDTO
  async create(data: UserEntity) {
    try {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
      return this.usersRepository.create(data);
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao criar usuário');
    }
  }

  async list() {
    //return this.prisma.user.findMany();
  }

  async search(id: number) {
    await this.exists(id);

/*     return this.prisma.user.findUnique({
      where: { id },
    }); */
  }

  async updateAll(
    id: number,
    { name, email, password, birthAt, role }: UpdatePutUserDTO,
  ) {
    console.log({ name, email, password, birthAt, role });

    await this.exists(id);

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);

/*     return this.prisma.user.update({
      data: {
        name,
        email,
        password,
        birthAt: birthAt ? new Date(birthAt) : null,
        role,
      },
      where: { id },
    }); */
  }

  async updatePartial(
    id: number,
    { name, email, password, birthAt, role }: UpdatePatchUserDTO,
  ) {
    await this.exists(id);
    const data: any = {};

    if (name) {
      data.name = name;
    }

    if (email) {
      data.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(password, salt);
    }

    if (birthAt) {
      data.birthAt = new Date(birthAt);
    }

    if (role) {
      data.role = role;
    }

/*     return this.prisma.user.update({
      data,
      where: { id },
    }); */
  }

  async delete(id: number) {
    await this.exists(id);

/*     return this.prisma.user.delete({
      where: { id },
    }); */
  }

  async exists(id: number) {
    // if (!(await this.search(id))) {
    //   throw new NotFoundException(`O usuário ${id} não existe.`);
    // }

/*     if (
      !(await this.prisma.user.count({
        where: { id },
      }))
    ) {
      throw new NotFoundException(`O usuário ${id} não existe.`);
    } */
  }
}
