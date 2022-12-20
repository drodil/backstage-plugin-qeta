import express from 'express';
import { Logger } from 'winston';
import { QetaStore } from '../database/QetaStore';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
export interface RouterOptions {
    identity: IdentityApi;
    database: QetaStore;
    logger: Logger;
    config: Config;
}
export declare function createRouter({ logger, database, identity, config, }: RouterOptions): Promise<express.Router>;
