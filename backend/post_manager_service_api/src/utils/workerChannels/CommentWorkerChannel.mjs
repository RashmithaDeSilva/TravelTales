import workerThread from 'worker-thread';
import { worker } from '../workers/CommentWorker.mjs';
import ErrorLogService from '../../services/ErrorLogService.mjs';
import { log } from '../ConsoleLog.mjs';
import { LogTypes } from '../enums/LogTypes.mjs';
import { CommentJobType } from '../enums/CommentJobType.mjs';


let instance;
const errorLogService = new ErrorLogService();
let commentServiceInstance;


async function getCommentService() {
    if (!commentServiceInstance) {
        const { default: CommentService } = await import('../../services/CommentService.mjs');
        commentServiceInstance = new CommentService();
    }
    return commentServiceInstance;
}

async function buildPool() {
    const channel = workerThread.createChannel(worker, 10);

    channel.on('done', async (error, result) => {
        if (error) {
            try {
                await errorLogService.createLog("CommentWorkerChannel", error);
            } catch (logError) {
                log(LogTypes.ERROR, logError);
            }
            return;
        }

        try {
            const service = await getCommentService();
            if (result.jobType === CommentJobType.CREATE) {
                await service.create(result.jwt, result.comment);
            }

            if (result.jobType === CommentJobType.UPDATE) {
                await service.update(result.comment);
            }   

        } catch (err) {
            try {
                await errorLogService.createLog("CommentWorkerChannel", error);

            } catch (e) {
                log(LogTypes.ERROR, `Comment creation failed: ${err}`);
            }
        }
    });

    channel.on('stop', () => log(LogTypes.INFO, "Comment Worker Channel Stopped"));
    return channel;
}

export default (async function getPool() {
    if (!instance) instance = await buildPool();
    return instance;
})();
