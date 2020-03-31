export default class Likes{
    constructor(){
        this.likes = [];
    };

    addLike(id, title, author, img){
        const like = {id, title, author, img};
        this.likes.push(like);
        this.persistData(this.likes); // persist data with local storage
        return like;
    };

    removeLike(id){
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);
        this.persistData(this.likes);
    };

    isLiked(id){
        return ((this.likes.findIndex(el => el.id === id)) !== (-1));
    };

    getNumLikes(){
        return this.likes.length;
    };

    persistData(){
        localStorage.setItem('likes', JSON.stringify(this.likes));
    };

    readStorage(){
        const storage = JSON.parse(localStorage.getItem('likes'));

        if(storage) this.likes = storage;
    };
};

