/// <reference types="node" />
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { Readable } from 'stream';
import { DocumentCollatorFactory } from '@backstage/plugin-search-common';
export declare type QetaCollatorFactoryOptions = {
    logger: Logger;
};
export declare type QetaDocument = {
    title?: string;
    location: string;
    content: string;
    tags?: string[];
    creator: string;
};
export declare class QetaCollatorFactory implements DocumentCollatorFactory {
    private readonly appBaseUrl;
    private readonly backendBaseUrl;
    private readonly logger;
    readonly type: string;
    private constructor();
    static fromConfig(config: Config, options: QetaCollatorFactoryOptions): QetaCollatorFactory;
    getCollator(): Promise<Readable>;
    execute(): AsyncGenerator<QetaDocument>;
}
