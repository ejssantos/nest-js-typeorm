import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthLoginDTO } from './dto/auth-login.dto';
//import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { AuthResetDTO } from './dto/auth-reset.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { join } from 'path';
import { FileService } from 'src/file/file.service';

@Controller('auth')
export class AuthController {
  constructor(
    //private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return await this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return await this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return await this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return await this.authService.reset(password, token);
  }

  /*
  @Post('check')
  async check(@Body() body) {
    return await this.authService.checkToken(body.token);
  }

  Ou...

  @Post('check')
  async check(@Headers('authorization') token) {
    //return headers;
    return await this.authService.checkToken((token ?? '').split(' ')[1]);
  }
  
  Ou...

  @UseGuards(AuthGuard)
  @Post('check')
  async check() {
    return { me: 'Ok' };
    //return await this.authService.checkToken((token ?? '').split(' ')[1]);
  }

  Ou...

  @UseGuards(AuthGuard)
  @Post('check')
  async check(@Req() req) {
    return { check: 'Ok', data: req.tokenPayload, user: req.user };
  }
  */

  @UseGuards(AuthGuard)
  @Post('check')
  async check(@User('email') user) {
    return { user };
  }

  //Upload de apenas 1 arquivo por vez
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('photo')
  //async uploadPhoto(@User() user, @UploadedFile() photo: Express.Multer.File) {
  async uploadPhoto(
    @User() user,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/jpeg' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 293 }), //convertendo para bytes
        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const path = join(
      __dirname,
      '..',
      '..',
      'storage',
      'photos',
      `photo-${Math.random()}.png`,
    );

    try {
      this.fileService.upload(photo, path);
    } catch (error) {
      throw new BadRequestException(error);
    }

    return { success: true };
  }

  //Upload de vários arquivos
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(AuthGuard)
  @Post('files')
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return files;
  }

  //Upload de vários arquivos, mas cada arquivo separado por field
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'photo',
        maxCount: 1,
      },
      {
        name: 'documents',
        maxCount: 10,
      },
    ]),
  )
  @UseGuards(AuthGuard)
  @Post('files-fields')
  async uploadFilesFields(
    @UploadedFiles()
    files: {
      photo: Express.Multer.File;
      documents: Express.Multer.File[];
    },
  ) {
    return files;
  }
}
