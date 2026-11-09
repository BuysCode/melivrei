import { BookCondition, ListingMode } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ListingImageDto {
  @ApiProperty() @IsUrl() url!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() altText?: string;
}
export class CreateListingDto {
  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @ApiProperty() @IsString() @MaxLength(160) author!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() isbn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() genre?: string;
  @ApiProperty() @IsString() @MaxLength(2000) description!: string;
  @ApiProperty({ enum: BookCondition })
  @IsEnum(BookCondition)
  condition!: BookCondition;
  @ApiProperty({ enum: ListingMode }) @IsEnum(ListingMode) mode!: ListingMode;
  @ApiPropertyOptional({ minimum: 0, description: 'Obrigatório para venda.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  @ApiPropertyOptional({ type: [ListingImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListingImageDto)
  images?: ListingImageDto[];
}
