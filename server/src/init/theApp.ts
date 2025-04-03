import express, { Express } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
export default (app: Express) => {
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
