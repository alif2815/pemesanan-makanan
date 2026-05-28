import { IsString, IsOptional, IsInt, Min, IsDateString, IsEmail } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  phone!: string;

  @IsDateString()
  date!: string;

  @IsString()
  time!: string;

  @IsInt()
  @Min(1)
  numberOfPeople!: number;
}
