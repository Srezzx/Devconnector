const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const profile = require('../../models/Profile')
const user = require("../../models/user");
const post = require("../../models/post");
const {
    check,
    validationResult
} = require('express-validator');
const auth = require("../../middleware/auth")
//@route POST api/post
//Test Create a post
//Access private
router.post("/", [auth, [
    check('text', 'Text field must be entered').not().isEmpty()
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
            user: req.user.id,

        });
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({
            msg: "Server error"
        });
    }


});


//@route Get api/post
//@desc GET all posts
//Access private

router.get("/", auth, async (req, res) => {

    try {

        var posts = await post.find().sort({
            date: -1
        });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send({
            msg: "Server error"
        });
    }
});

//@route POST api/post/:post_id
//@desc GET post by id
//Access private

router.get("/:id", auth, async (req, res) => {

    try {
        var Post = await post.findById(req.params.id);
        if (!Post) {
            return res.status(404).json({
                msg: "POST not found"
            });
        }
        res.json(Post);
    } catch (err) {
        console.error(err.message);
        if (!error.kind === "ObjectId") {
            return res.status(404).json({
                msg: "POST not found"
            });
        }
        res.status(500).send({
            msg: "Server error"
        });
    }
});


//@route DELETE api/post/:post_id
//@desc DELETE   delete a post by id
//Access private

router.delete("/:id", auth, async (req, res) => {

    try {
        var Post = await post.findById(req.params.id);
        //CHECK that user is the owner of the post
        if (!Post) {
            return res.status(404).json({
                msg: "POST not found"
            });
        }
        if (Post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: "You are not authorized to delete this post"
            });

        }
        await Post.remove();
        res.json({
            msg: "POST removed"
        });
    } catch (err) {
        console.error(err.message);
        if (!error.kind === "ObjectId") {
            return res.status(404).json({
                msg: "POST not found"
            });
        }
        res.status(500).send({
            msg: "Server error"
        });
    }
});

//@route PUT api/post/like/:id
//Test Like a post
//Access private
router.put("/like/:id", auth, async (req, res) => {
    try {
        const postt = await post.findById(req.params.id);
        //CHeck if already has been liked or not
        if (postt.likes.filter(like => (like.user.toString() === req.user.id)).length > 0) {
            return res.status(400).json({
                msg: "Post already liked"
            });
        }

        postt.likes.unshift({
            user: req.user.id
        });
        await postt.save();
        res.json(postt.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");

    }
});

//@route PUT api/post/unlike/:id
//Test Unlike a post
//Access private
router.put("/unlike/:id", auth, async (req, res) => {
    try {
        const postt = await post.findById(req.params.id);
        //CHeck if already has been liked or not
        if (postt.likes.filter(like => (like.user.toString() === req.user.id)).length === 0) {
            return res.status(400).json({
                msg: "Post already liked"
            });
        }

        //GET remove index
        const removeIndex = postt.likes.map(like => like.user.toString()).indexOf(req.user.id);
        postt.likes.splice(removeIndex, 1);
        await postt.save();

        res.json(postt.likes)

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");

    }
});

//@route POST api/posts/comment/:id
//Test       Comment on  a post
//Access private
router.post("/comment/:id", [auth, [
    check('text', 'Text field must be entered').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });

    }
    try {
        const user = await User.findById(req.user.id).select('-password');

        const postt = await post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        postt.comments.unshift(newComment);
        await postt.save();
        res.json(postt.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send({
            msg: "Server error"
        });
    }


});

//@route DELETE api/post/comment/:comment_id
//@desc DELETE   delete a comment by id
//Access private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {

    try {
        const postt = await post.findById(req.params.id);

        //Pull out comment
        const comment = postt.comments.find(comment => comment.id === req.params.comment_id);

        //Check if comment exists
        if (!comment) {
            return res.status(404).json({
                msg: " Comment not found, try again "
            });
        }

        //check user is owner
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: "User not authorized"
            })
        }

        //GET remove index
        const removeIndex = postt.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        postt.comments.splice(removeIndex, 1);
        await postt.save();
        res.json(postt.comments)


    } catch (err) {
        console.error(err.message);
        res.status(500).send({
            msg: "Server error"
        });
    }
});



module.exports = router;