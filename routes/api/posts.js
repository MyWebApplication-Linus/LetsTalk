const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');
const {
    route
} = require('./profile');
const {
    request
} = require('express');
//const Profile = require('../../models/Profile');


//@route  POST api/post
//@desc   Create new Post
//@access  private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()

]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }


    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//@route  GET api/post
//@desc   Create new Post
//@access  private

router.get('/', auth, async (req, res) => {

    try {
        const posts = await Post.find().sort({
            date: -1
        });
        res.json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});

//@route  GET api/post by :/id
//@desc   Create new Post
//@access  private

router.get('/:id', auth, async (req, res) => {

    try {
        const posts = await Post.findById(req.params.id);

        if (!posts) {
            return res.status(404).json({
                msg: 'Post not found '
            });
        }
        res.json(posts);

    } catch (err) {
        console.error(err.message);
        if (err.kend === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found '
            });
        }
        res.status(500).send('Server error');
    }

});


//@route  Delete api/post by :/id
//@desc   delete new Post
//@access  private

router.delete('/:id', auth, async (req, res) => {

    try {
        const posts = await Post.findById(req.params.id);

        if (!posts) {
            return res.status(404).json({
                msg: 'Post not found '
            });
        }

        // Check user
        if (posts.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized '
            });
        }
        await posts.remove();

        res.json({
            msg: 'Post removed '
        });

    } catch (err) {
        console.error(err.message);
        if (err.kend === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found '
            });
        }

        res.status(500).send('Server error');
    }

});


//@route  Put api/post/like/:id
//@desc   like a new Post
//@access  private

router.put('/like/:id', auth, async (req, res) => {

    try {
        const posts = await Post.findById(req.params.id);

        // Check if user has already liked the post
        if (posts.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: "Post already liked"
            });
        }

        posts.likes.unshift({
            user: req.user.id
        });
        await posts.save();

        res.json(posts.likes)


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

//@route  Put api/post/like/:id
//@desc   like a new Post
//@access  private


router.put('/unlike/:id', auth, async (req, res) => {

    try {
        const posts = await Post.findById(req.params.id);

        // Check if user has already liked the post
        if (posts.likes.filter(like => like.user.toString() === req.user.id).length == 0) {
            return res.status(400).json({
                msg: "Post has not yet been liked"
            });
        }

        //Get remove Index
        const removeIndex = posts.likes.map(like => like.user.toString()).indexOf(req.user.id);

        posts.likes.splice(removeIndex, 1)
        await posts.save();

        res.json(posts.likes)


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//@route  POST api/posts/comment/:id
//@desc   Comment post
//@access  private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()

]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }


    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        //This adds it to the new comments
        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

});

//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   delete a comment on a post
//@access  private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        //Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //Make sure comment exist
        if (!comment) {
            return res.status(404).json({
                msg: "Comment does not exist "
            })
        }
        //Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});


module.exports = router;