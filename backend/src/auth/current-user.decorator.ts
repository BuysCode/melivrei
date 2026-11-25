import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Dados mínimos do usuário autenticado disponibilizados aos controladores. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
/** Injeta o usuário validado pelo {@link BetterAuthGuard} no parâmetro da rota. */
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthenticatedUser =>
    context.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user,
);
