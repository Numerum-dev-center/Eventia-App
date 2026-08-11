import * as bcrypt from 'bcrypt';

export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10); // 10 = nombre de rounds comme BCryptPasswordEncoder
};

export const comparePassword = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
