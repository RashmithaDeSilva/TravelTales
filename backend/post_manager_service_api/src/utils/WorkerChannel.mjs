import workerThread from 'worker-thread';
import { worker } from './workers/PostWorker.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import { log } from './ConsoleLog.mjs';
import { LogTypes } from './enums/LogTypes.mjs';

let instance;
const errorLogService = new ErrorLogService();
let postServiceInstance;

async function getPostService() {
    if (!postServiceInstance) {
        const { default: PostService } = await import('../services/PostService.mjs');
        postServiceInstance = new PostService();
    }
    return postServiceInstance;
}

async function buildPool() {
    const channel = workerThread.createChannel(worker, 10);

    channel.on('done', async (error, result) => {
        if (error) {
            try {
                await errorLogService.createLog("WorkerChannel", error);
            } catch (logError) {
                log(LogTypes.ERROR, logError);
            }
            return;
        }

        try {
            const service = await getPostService();
            await service.create(result.jwt, result.post);

        } catch (err) {
            try {
                await errorLogService.createLog("WorkerChannel", error);

            } catch (e) {
                log(LogTypes.ERROR, `Post creation failed: ${err}`);
            }
        }
    });

    channel.on('stop', () => log(LogTypes.INFO, "Worker Channel Stopped"));
    return channel;
}

export default (async function getPool() {
    if (!instance) instance = await buildPool();
    return instance;
})();
