import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Patch,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UserService } from './user.service';
import { LogInterceptor } from 'src/interceptors/log.interceptor';
import { ParamId } from 'src/decorators/param-id.decorator';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/role.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

//Em nível de classe
@UseGuards(ThrottlerGuard, AuthGuard, RoleGuard)
//@UseGuards(AuthGuard, RoleGuard)
@UseInterceptors(LogInterceptor)
@Controller('users')
@Roles(Role.Admin)
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Em nível de rota
  //@UseGuards(ThrottlerGuard)
  //@Roles(Role.Admin)
  //@UseInterceptors(LogInterceptor)
  @Post()
  /*
  //Exemplo de uso de ParseIntPipe no decorator @Body()
  async create(
    @Body(new ParseIntPipe({ errorHttpStatusCode: 422 })) user: CreateUserDTO,
  ) {
    return this.userService.create(user);
  }
  */
  async create(@Body() user: CreateUserDTO) {
    return this.userService.create(user);
  }

  // @Get()
  // async list() {
  //   return { users: [] };
  // }

  //@UseGuards(ThrottlerGuard)
  //Definindo um limite de acesso em nível de rota. ttl em milisegundos.
  //@Throttle({ default: { limit: 5, ttl: 60000 } })
  //@Roles(Role.Admin, Role.User)
  @Get()
  async list() {
    return this.userService.list();
  }

  /*
  @Get(':id')
  async search(@Param() params) {
    return { users: {}, params };
  }

  Ou...
  
  @Get(':id')
  async search(@Param('id', ParseIntPipe) id: number) {
    return { users: {}, id };
  }
  
  Ou...

  @Get(':id')
  async search(@Param('id', ParseIntPipe) id: number) {
    return this.userService.search(id);
  }
  */

  //Caso deseje ignorar o Throttle
  @SkipThrottle()
  @Roles(Role.User, Role.Admin)
  //Usando o Param Decorator, ou seja, um decorator personalizado.
  @Get(':id')
  async search(@ParamId() id: number) {
    console.log({ id });
    return this.userService.search(id);
  }

  /*
  @Put(':id')
  async updateAll(@Body() user: UpdatePutUserDTO, @Param() params) {
    return {
      method: 'PUT',
      user,
      params,
    };
  }
  
  //Ou...

  async updateAll(@Body() {name, email, password}: UpdatePutUserDTO, @Param() params) {
    return {
      method: 'PUT',
      name, email, password,
      params,
    };
  }

  @Put(':id')
  async updateAll(@Body() user: UpdatePutUserDTO, @Param('id', ParseIntPipe) id: number) {
    return {
      method: 'PUT',
      user,
      id,
    };
  }

  @Patch(':id')
  async updatePartial(@Body() user: UpdatePatchUserDTO, @Param('id', ParseIntPipe) id: number) {
    return {
      method: 'PATCH',
      user,
      id,
    };
  }
*/

  @Put(':id')
  async updateAll(
    @Body() user: UpdatePutUserDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.updateAll(id, user);
  }

  @Patch(':id')
  async updatePartial(
    @Body() user: UpdatePatchUserDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.updatePartial(id, user);
  }

  /*
  @Delete(':id')
  async delete(@Param() params) {
    return { params }
  }
  
  Ou...
  
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return { id }
  }
  */

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
