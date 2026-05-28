import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
