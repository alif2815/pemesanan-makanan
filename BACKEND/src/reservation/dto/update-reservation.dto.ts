import { IsOptional, IsString, IsInt, Min, IsDateString, IsEmail, IsIn } from 'class-validator';

export class UpdateReservationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfPeople?: number;

  @IsOptional()
  @IsIn(['PAID', 'NOT_PAID', 'PENDING'])
  status?: string;
}
