import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer/dist';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
  ) {}

  private audience: string = 'users';
  private issuer: string = 'login';

  createToken(user: User) {
    /*
    const date = Date.now() + 1000 * 60 * 1; //Adicionando 1 minuto. Date.now() retorna em milisegundos.
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const formattedTime = formatter.format(date);
    console.log(formattedTime);
    */

    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '30 minutes', //'7 days', '60 seconds'
          subject: String(user.id),
          issuer: this.issuer, //emissor
          audience: this.audience, //quem tem acesso ao token
          //notBefore: '30 seconds',
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });

      return data;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async login(email: string, password: string) {
    console.log(process.env);
    //Busca se há email cadastrado
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`Usuário ${email} não autorizado.`);
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      throw new UnauthorizedException('Senha inválida!');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(`E-mail ${email} não autorizado.`);
    }

    // Enviar um e-mail...
    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '30 minutes',
        subject: String(user.id),
        issuer: 'forget', //emissor
        audience: 'users', //quem tem acesso ao token
      },
    );

    await this.mailer.sendMail({
      subject: 'Recuperação de Senha',
      to: 'ejssantos@hotmail.com',
      //html: '', //Conteúdo em HTML,
      template: 'forget', //Conteúdo em Template
      context: {
        name: user.name,
        token: token,
      },
    });

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async reset(password: string, token: string) {
    // TODO: validar o token...
    try {
      const data:any = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'forget',
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token inválido.');
      }

      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(password, salt);

      const user = await this.prismaService.user.update({
        where: {
          id: Number(data.id),
        },
        data: {
          password,
        },
      });

      return this.createToken(user);

    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);
    return this.createToken(user);
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }
}
