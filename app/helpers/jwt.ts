import jwt from "jsonwebtoken";
import { jwtAccessSecret } from "../../config/jwt";

export const createAccessToken = (account: string) => {
  return jwt.sign({ account }, jwtAccessSecret, {
    algorithm: "HS256",
    expiresIn: "1h"
  });
};
