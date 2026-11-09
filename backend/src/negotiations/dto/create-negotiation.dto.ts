import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
export class CreatePurchaseDto {
  @ApiProperty() @IsUUID() listingId!: string;
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
