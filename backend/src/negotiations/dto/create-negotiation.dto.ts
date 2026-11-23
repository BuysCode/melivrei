import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
export class CreatePurchaseDto {
  @ApiProperty() @IsUUID() listingId!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() deferCheckout?: boolean;
}
export class CreateTradeDto {
  @ApiProperty() @IsUUID() listingId!: string;
  @ApiProperty() @IsUUID() offeredListingId!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
