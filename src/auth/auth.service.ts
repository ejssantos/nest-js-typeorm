import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { UserEntity } from 'src/user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  private audience: string = 'users';
  private issuer: string = 'login';

  createToken(user: AuthRegisterDTO) {
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
    //console.log(process.env);

    //Busca se há email cadastrado
    const user = await this.usersRepository.findOneBy({ email });
    /* Ou...
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    */

    //console.log(user);

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
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException(`E-mail ${email} não autorizado.`);
    }

    //console.log('User', user);

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

  async reset(password: string, token: string) {
    try {
      const data: any = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'forget',
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token inválido.');
      }

      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(password, salt);

      await this.usersRepository.update(Number(data.id), {
        password,
      });

      const user = await this.userService.search(Number(data.id));

      return this.createToken(user);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async register(data: UserEntity) {
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
