
const databaseGetUser = id =>
    id === 'not-exists'
        ? Promise.reject('some weird database error')
        : Promise.resolve({ id, username: 'username' });

const databaseGetPosts = user =>
    user.id === 'fail-to-get-posts'
        ? Promise.reject('some weird database error for posts')
        : Promise.resolve([{ title: 'A' }, { title: 'B' }]);

async function getUserWithPosts(id) {
    const user = await databaseGetUser(id).catch(err => { throw `user ${id} doesn't exists `; });
    const posts = await databaseGetPosts(user).catch(err => { throw 'failed to load posts'; });
    return { user, posts };
}

getUserWithPosts('lubien').then(console.log);               // works fine
getUserWithPosts('lubien').then(console.log).catch(console.error);        // 'user not-exists doesn't exists'
getUserWithPosts('fail-to-get-posts').then(console.log).catch(console.error); // 'failed to load posts'