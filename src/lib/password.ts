import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';

export function hashMd5(...values: string[]) {
    const concat = values.join(':');
    return createHash('md5').update(concat).digest('hex');
}

export const hashPassword = async (password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  return hashed;
};