import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class CreateExampleDto {
  @Length(2, 20, { message: 'name length between 2,20' })
  @IsString({ message: 'name required' })
  name: string;

  @IsString({ message: 'Invalid cover' })
  @IsOptional()
  cover: string;

  @IsString({ each: true, message: 'Invalid image' })
  @IsArray({ message: 'Invalid images' })
  @IsOptional()
  images: string[];
}
