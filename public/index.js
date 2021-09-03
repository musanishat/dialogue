function showComment(docs, i){
    const userReq = new XMLHttpRequest();
    userReq.open('GET', 'http://localhost:3000/u/:' + docs.postedBy , true);
        userReq.addEventListener('load', function(){
            const response = JSON.parse(userReq.responseText);
            if(response.error === undefined){
                //I cant for the life of me get these comments to display properly
                //I've been trying for 2 hours, and this is due soon
                //so I've decided to leave them as they are
                //a refresh will make them display properly!
                //sorry about that...
                const datePosted = String(Date(docs.datePosted)).split('-')[0].split(' ');
                const comments = document.getElementsByClassName('comments')[i];
                const comment = document.createElement('comment');
                const comtext = document.createElement('com-text');
                const composter = document.createElement('com-poster');
                comtext.innerHTML = docs.commentText + '<br>';
                composter.innerHTML = '<a href = "/home?filter=user&user=' + response.user._id 
                + '"><b>' + response.user.username + '</b></a>'
                 + " - " + datePosted[2] + " " + datePosted[1] + " " + datePosted[3];
                comment.appendChild(comtext);
                comment.appendChild(composter);
                comments.appendChild(comment);
            }
        });
    userReq.send();
   
}
function main(){
    const discuss = document.getElementsByClassName('image');
    const x = document.getElementById('x');
    const user = document.getElementsByClassName('user')[0];
    for(let i = 0; i < discuss.length; i++){
        let clicked = true;
        const button = discuss[i];
        button.addEventListener('click', function(){
            const artModal = document.getElementsByClassName('art-modal')[i];
            x.style.display = 'initial';
            artModal.style.display = 'initial';
            const commentButton = document.getElementsByClassName('create-comment')[i];
            commentButton.addEventListener('click', function(){
                if(clicked == true){
                    clicked = false;
                    const commentText = document.getElementsByClassName('comment-text')[i].value;
                    const commentReq = new XMLHttpRequest();
                    commentReq.open('POST', 'http://localhost:3000/comment/:' + artModal.id , true);
                    commentReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    commentReq.addEventListener('load', function(){
                        if(commentReq.status >= 200 && commentReq.status < 400){
                            const response = JSON.parse(commentReq.responseText);
                            if(response.error === undefined){
                                showComment(response.docs, i);
                            }
                            else{
                                console.log(response);
                            }
                        }
                    });
                    commentReq.send('commentText=' + commentText);
                }
                
            });
            x.addEventListener('click', function(){
                artModal.style.display = 'none';
            });
            const upvote = document.getElementsByClassName('upvote')[i];
            upvote.addEventListener('click', function(){
                const update = new XMLHttpRequest();
                update.open('POST', 'http://localhost:3000/upvote/:' + artModal.id , true);
                update.addEventListener('load', function(){
                    const response = JSON.parse(update.responseText);
                    if(response.error === undefined){
                        upvote.style.color = 'hotpink';
                        const upvotes = document.getElementsByClassName('num')[i];
                        const prev = parseInt(upvotes.innerHTML);
                        upvotes.innerHTML = prev + 1;
                    }
                    else{
                        console.log(response);
                    }
                });
                update.send();
            });

            const star = document.getElementsByClassName('star')[i];
            star.addEventListener('click', function(){
                const update = new XMLHttpRequest();
                update.open('POST', 'http://localhost:3000/favorite/:' + artModal.id , true);
                update.addEventListener('load', function(){
                    const response = JSON.parse(update.responseText);
                    if(response.error === undefined){
                        star.innerHTML = '★';
                        star.style.color = 'hotpink';
                    }
                    else{
                        console.log(response);
                    }
                });
                update.send();
            });

            const commentSec = document.getElementsByClassName('leave-comment')[i];
            if(user == null){
                upvote.style.display = 'none';
                star.style.display = 'none';
                commentSec.style.display = 'none';           
            }
            else{
                upvote.style.display = 'initial';
                star.style.display = 'initial';
                commentSec.style.display = 'initial';
                const userReq = new XMLHttpRequest();
                userReq.open('GET', 'http://localhost:3000/u/:' + user.id , true);
                userReq.addEventListener('load', function(){
                    const response = JSON.parse(userReq.responseText);
                    if(response.error === undefined){
                        if(response.user.favorites.includes(artModal.id)){
                            star.innerHTML = '★';
                            star.style.color = 'hotpink';
                        }
                        if(response.user.upvotes.includes(artModal.id)){
                            upvote.style.color = 'hotpink';
                        }
                    }
                });
                userReq.send();
            }
        });
    }   
}

document.addEventListener('DOMContentLoaded', main);
