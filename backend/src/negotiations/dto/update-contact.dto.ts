import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/** Número internacional do próprio anunciante, sem símbolos ou espaços. */
export class UpdateContactDto {
  @ApiProperty({
    example: '5551999999999',
    description: 'Código do país, DDD e número; somente dígitos.',
  })
  @IsString()
  @Matches(/^[1-9]\d{7,14}$/, {
    message:
      'Informe o WhatsApp com código do país e DDD, usando de 8 a 15 dígitos.',
  })
  whatsappNumber!: string;
}
