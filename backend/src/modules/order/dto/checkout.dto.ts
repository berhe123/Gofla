import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateAddressDto } from '../../user/dto/address.dto';

export class CheckoutDto {
  @ApiPropertyOptional({ description: 'Existing saved address id' })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ type: CreateAddressDto, description: 'Inline new address' })
  @IsOptional()
  address?: CreateAddressDto;
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['PENDING', 'PAID', 'FULFILLED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
  })
  @IsString()
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  trackingNumber?: string;
}
