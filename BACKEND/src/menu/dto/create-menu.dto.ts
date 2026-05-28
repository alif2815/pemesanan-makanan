import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @MaxLength(100)
  nama!: string;

  @IsNumber()
  @Min(0)
  harga!: number;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsString()
  @MaxLength(50)
  category!: string;

  @IsOptional()
  @IsString()
  imageURL?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
