class PostModel {
    
    constructor (userId, title, content, country, dateOfVisit, imageId = null) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.country = country;
        this.dateOfVisit = dateOfVisit;
        this.imageId = imageId;
    }
}

export default PostModel;