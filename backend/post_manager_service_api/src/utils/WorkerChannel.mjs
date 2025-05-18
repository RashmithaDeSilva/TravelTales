import workerThread from 'worker-thread';
import { worker } from './workers/PostWorker.mjs';
import ErrorLogService from '../services/ErrorLogService.mjs';
import { log } from './ConsoleLog.mjs';
import { LogTypes } from './enums/LogTypes.mjs';


let instance;
const errorLogService = new ErrorLogService();


async function buildPool() {
    const channel = workerThread.createChannel(worker, 10);

    channel.on('done', async (error, result) => {
        console.log(error);
        if (error) {
            try {
                await errorLogService.createLog("WorkerChannel", error);
            } catch (error) {
                log(LogTypes.ERROR, error);
            }
        }

        // Send result to user using notification service
        console.log(result);

    });

    channel.on('stop', () => log(LogTypes.INFO, "Worker Channel Stopped"));
  return channel;
}

// default export -- always the same object
export default (async function getPool() {
  if (!instance) instance = await buildPool();
  return instance;
})();