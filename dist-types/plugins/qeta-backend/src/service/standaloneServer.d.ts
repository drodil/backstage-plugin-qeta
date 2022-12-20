/// <reference types="node" />
import { Server } from 'http';
import { Logger } from 'winston';
export interface ServerOptions {
    port: number;
    enableCors: boolean;
    logger: Logger;
}
export declare function startStandaloneServer(options: ServerOptions): Promise<Server>;
