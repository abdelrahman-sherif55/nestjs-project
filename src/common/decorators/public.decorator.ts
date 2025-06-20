import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/keys.constant';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
