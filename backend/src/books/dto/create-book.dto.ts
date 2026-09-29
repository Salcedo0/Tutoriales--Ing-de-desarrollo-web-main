import { IsInt, IsNumber, IsString, Length, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsString()
  @Length(1, 100)
  category: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}
