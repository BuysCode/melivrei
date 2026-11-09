import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
export class ProcessPaymentEventDto {
  @ApiProperty() @IsUUID() paymentId!: string;
  @ApiProperty() @IsString() providerEventId!: string;
  @ApiProperty({ enum: ['approved', 'refused', 'expired'] })
  @IsEnum(['approved', 'refused', 'expired'])
  eventType!: 'approved' | 'refused' | 'expired';
  @ApiProperty() @IsString() signature!: string;
}
