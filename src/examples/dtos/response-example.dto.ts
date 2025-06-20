import { Exclude, Expose, Transform } from 'class-transformer';
import { FilePath } from '../../common/constants/paths.constant';

export class ResponseExampleDto {
  @Expose({ name: 'id' })
  _id: string;

  name: string;

  @Transform(({ value }) => {
    const baseUrl = process.env.BASE_URL;
    return value && value.startsWith('example')
      ? `${baseUrl}/${FilePath.EXAMPLES}/${value}`
      : value;
  })
  cover: string;

  @Transform(({ value }) => {
    const baseUrl = process.env.BASE_URL;
    return value.map((image: string) =>
      image.startsWith('example')
        ? `${baseUrl}/${FilePath.EXAMPLES}/${image}`
        : image,
    );
  })
  images: string[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  __v: number;

  constructor(partial: Partial<ResponseExampleDto>) {
    Object.assign(this, partial);
  }
}
