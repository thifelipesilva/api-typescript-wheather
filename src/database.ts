import config, { IConfig } from 'config';
import mongoose, { connect as mongooseConnect, connection } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');
export const connect = async (): Promise<void> => {
    await mongooseConnect(dbConfig.get('mongoUrl'));
};

export const close = (): Promise<void> => connection.close();