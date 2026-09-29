import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

// Without these decorators the global ValidationPipe would strip every field
// — `whitelist: true` keeps only properties that declare a rule — and the
// repository would receive an empty object.
export class CreateReviewDto {
  @IsInt()
  @Min(1)
  bookId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @Length(1, 2000)
  comment: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  author?: string;
}
