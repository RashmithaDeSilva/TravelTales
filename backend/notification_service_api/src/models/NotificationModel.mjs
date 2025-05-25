class NotificationModel {

    constructor (userId, title, content, info = null, isCheck = false, createdAt = null, id = null) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.isCheck = isCheck;
        this.info = info;
        this.createdAt = createdAt;
        this.id = id;
    }
}

export default NotificationModel;