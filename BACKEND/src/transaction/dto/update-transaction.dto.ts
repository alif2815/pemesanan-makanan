import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsIn(['PAID', 'NOT_PAID', 'PENDING'])
  status?: string;
}
