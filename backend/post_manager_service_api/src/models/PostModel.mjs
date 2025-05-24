class PostModel {
    
    constructor (userId, title, content, country, dateOfVisit, imageId = null, publishDate = null, 
        id = null, comments = [], commentsCount = null, likes = null, disLikes = null, userName = null) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.country = country;
        this.dateOfVisit = dateOfVisit;
        this.imageId = imageId;
        this.publishDate = publishDate;
        this.id = id;
        this.comments = comments;
        this.commentsCount = commentsCount;
        this.likes = likes;
        this.disLikes = disLikes;
        this.userName = userName;
    }
}

export default PostModel;