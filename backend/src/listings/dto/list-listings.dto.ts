import { ListingMode } from '../../generated/prisma/client.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListListingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: ListingMode })
  @IsOptional()
  @IsEnum(ListingMode)
  mode?: ListingMode;
}
