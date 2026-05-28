import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status?: string;
}
