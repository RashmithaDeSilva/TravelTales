import ToxicityDetectionService from '../../services/ToxicityDetectionService.mjs';
import NotificationServices from '../../services/NotificationServices.mjs';
import NotificationModel from '../../models/NotificationModel.mjs';
import CommonErrors from '../errors/CommonErrors.mjs';
import CommentErrors from '../errors/CommentErrors.mjs';
import ErrorLogService from '../../services/ErrorLogService.mjs';


const toxicityDetectionService = new ToxicityDetectionService();
const notificationServices = new NotificationServices();
const errorLogService = new ErrorLogService();


const getResult = async (jwt, jobId) => {
    while (true) {
        const result = await toxicityDetectionService.result(jwt, jobId);
        if (result.status === 'done') return result;
        await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5s
    }
}

const worker = async ({ jwt, comment, jobType }) => {
    try {
        const commentToxicity = await toxicityDetectionService.predict(jwt, comment.content);

        const [commentToxicityResult] = await Promise.all([
            getResult(jwt, commentToxicity.job_id),
        ]);

        const isToxic = [
            ...Object.values(commentToxicityResult.result),
        ].some(value => value > 0.6);

        if (isToxic) {
            throw new Error(CommentErrors.COMMENT_CONTAINS_TOXIC_CONTENT);
        }

        return {
            "jwt": jwt,
            "comment": comment,
            "jobType": jobType,
        };

    } catch (error) {
        const err = (error.message === CommentErrors.COMMENT_CONTAINS_TOXIC_CONTENT) 
        ? error.message : CommentErrors.COMMENT_CONTAINS_TOXIC_CONTENT;

        if(err.message === CommonErrors.INTERNAL_SERVER_ERROR) {
            await errorLogService.createLog('CommentWorker', error, {
                "jwt": jwt, 
                "post": post,
                "jobType": jobType,
            });
        }
        await notificationServices.create(jwt, new NotificationModel(
            `Your comment canot publish - ${ comment.content }`,
            err.message,
            {},
        ));
    }
}


export { worker };
