import dotenv from 'dotenv';

dotenv.config();

export default {
  MONGO_STRING: process.env.DATABASE_URL,
  PORT: process.env.PORT || 3000,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE,
} as const;
