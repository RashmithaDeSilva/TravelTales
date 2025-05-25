class NotificationModel {

    constructor (title, content, info = null, userId = null) {
        this.title = title;
        this.content = content;
        this.info = info;
        this.userId = userId;
    }
}

export default NotificationModel;