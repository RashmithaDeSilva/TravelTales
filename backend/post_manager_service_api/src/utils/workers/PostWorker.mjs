import CountryFinderService from '../../services/CountryFinderService.mjs';
import ToxicityDetectionService from '../../services/ToxicityDetectionService.mjs';
import NotificationServices from '../../services/NotificationServices.mjs';
import NotificationModel from '../../models/NotificationModel.mjs';
import { DitectType } from '../enums/DitectType.mjs';
import PostErrors from '../errors/PostErrors.mjs';
import CommonErrors from '../errors/CommonErrors.mjs';
import ErrorLogService from '../../services/ErrorLogService.mjs';
import { CountryTrype } from '../enums/CountryType.mjs';


const countryFinderService = new CountryFinderService();
const toxicityDetectionService = new ToxicityDetectionService();
const notificationServices = new NotificationServices();
const errorLogService = new ErrorLogService();


const getResult = async (jwt, jobId, ditectType) => {
    while (true) {
        let result;
        if (ditectType === DitectType.TOXICITY) {
            result = await toxicityDetectionService.result(jwt, jobId);

        } else if (ditectType === DitectType.COUNTRY) {
            result = await countryFinderService.result(jwt, jobId);
        }
        if (result.status === 'done') return result;
        await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5s
    }
}

const worker = async ({ jwt, post, jobType }) => {
    try {
        const titleToxicity = await toxicityDetectionService.predict(jwt, post.title);
        const contentToxicity = await toxicityDetectionService.predict(jwt, post.content);

        const [titleToxicityResult, contentToxicityResult] = await Promise.all([
            getResult(jwt, titleToxicity.job_id, DitectType.TOXICITY),
            getResult(jwt, contentToxicity.job_id, DitectType.TOXICITY)
        ]);

        const isToxic = [
            ...Object.values(titleToxicityResult.result),
            ...Object.values(contentToxicityResult.result)
        ].some(value => value > 0.6);

        if (isToxic) {
            throw new Error(PostErrors.POST_CONTAINS_TOXIC_CONTENT);
        }

        if (post.country === CountryTrype.FIND) {
            const findCountry = await countryFinderService.predict(jwt, `${ post.title }. ${ post.content }`);
            const [findCountryResult] = await Promise.all([
                getResult(jwt, findCountry.job_id, DitectType.COUNTRY),
            ]);
            post.country = findCountryResult.result[0].country;
        }
        return {
            "jwt": jwt,
            "post": post,
            "jobType": jobType,
        };

    } catch (error) {
        const err = (error.message === PostErrors.POST_CONTAINS_TOXIC_CONTENT) 
        ? error.message : CommonErrors.INTERNAL_SERVER_ERROR;

        if(err.message === CommonErrors.INTERNAL_SERVER_ERROR) {
            await errorLogService.createLog('PostWorker', error, {
                "jwt": jwt, 
                "post": post,
                "jobType": jobType,
            });
        }
        await notificationServices.create(jwt, new NotificationModel(
            `Your post canot publish - ${ post.title }`,
            err.message,
            {},
        ));
    }
}


export { worker };
