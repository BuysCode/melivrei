import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { auth } from '../auth.js';
import type { AuthenticatedUser } from './current-user.decorator.js';

@Injectable()
/** Valida a sessão Better Auth e anexa o usuário normalizado à requisição. */
export class BetterAuthGuard implements CanActivate {
  /**
   * Autoriza apenas sessões ativas e associa seus dados à requisição HTTP.
   *
   * @throws {UnauthorizedException} Quando a sessão não existe ou a conta está indisponível.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session || session.user.status !== 'ACTIVE')
      throw new UnauthorizedException('Sessão inválida ou conta indisponível.');

    request.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    };
    return true;
  }
}
