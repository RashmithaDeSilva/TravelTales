import CountryFinderService from '../../services/CountryFinderService.mjs';
import ToxicityDetectionService from '../../services/ToxicityDetectionService.mjs';
// import PostService from '../../services/PostService.mjs';


const countryFinderService = new CountryFinderService();
const toxicityDetectionService = new ToxicityDetectionService();
// const postService = new PostService();


const getResult = async (jwt, jobId) => {
    while (true) {
        const result = await toxicityDetectionService.result(jwt, jobId);
        if (result.status === 'done') return result;
        await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 3 minit
    }
}

const worker = async ({ jwt, post }) => {
    try {
        const titleToxicity = await toxicityDetectionService.predict(jwt, post.title);
        const contentToxicity = await toxicityDetectionService.predict(jwt, post.content);

        const [titleResult, contentResult] = await Promise.all([
            getResult(jwt, titleToxicity.job_id),
            getResult(jwt, contentToxicity.job_id)
        ]);

        console.log(titleResult);
        console.log(contentResult);

        // will implement logic

        return true;

    } catch (error) {
        console.log(error);
    }
}


export { worker };
