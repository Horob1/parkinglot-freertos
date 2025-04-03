import jwt from 'jsonwebtoken';

const signToken = <T>({ payload, privateKey, options }: { payload: T; privateKey: string; options: jwt.SignOptions }) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(payload as any, privateKey, options, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    });
  });

const verifyToken = <T>(token: string, privateKey: string) => {
  return new Promise<T>((resolve, reject) => {
    jwt.verify(token, privateKey, (err, payload) => {
      if (err) reject(err);
      else resolve(payload as T);
    });
  });
};

export { signToken, verifyToken };
