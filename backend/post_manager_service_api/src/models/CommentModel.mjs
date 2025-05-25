class CommentModel {

    constructor (postId, userId, content, createdAt = null, id = null, userName = null) {
        this.postId = postId;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
        this.id = id;
        this.userName = userName;
    }
}

export default CommentModel;