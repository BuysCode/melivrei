import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
/** Dados necessários para iniciar a compra de um anúncio de venda. */
export class CreatePurchaseDto {
  @ApiProperty() @IsUUID() listingId!: string;
}
/** Dados necessários para propor a troca entre dois anúncios. */
export class CreateTradeDto {
  @ApiProperty() @IsUUID() listingId!: string;
  @ApiProperty() @IsUUID() offeredListingId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
