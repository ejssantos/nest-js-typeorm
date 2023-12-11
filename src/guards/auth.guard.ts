import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    console.log('authorization: ', (authorization ?? '').split(' ')[1]);

    try {
      const data = this.authService.checkToken(
        (authorization ?? '').split(' ')[1],
      );

      console.log('Dados: ', data);

      request.tokenPayload = data;

      request.user = await this.userService.search(data.id);

      return true;
    } catch (e) {
      return false;
    }
  }
}
