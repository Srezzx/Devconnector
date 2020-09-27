   const express = require('express');
   const router = express.Router();
   const auth = require('../../middleware/auth');
   const User = require("../../models/user");
   const request = require("express");
   const config = require("config");
   const {
       check,
       validationResult
   } = require('express-validator');
   const Profile = require('../../models/Profile')
   //@route GET api/profile/me
   //@desc GET current user's profile
   //@access  Private
   router.get("/me", auth, async (req, res) => {

       try {
           const profile = await Profile.findOne({
               user: req.user.id
           }).populate('user', [
               'name',
               'avatar'
           ]);
           if (!profile) {
               return res.status(400).json({
                   msg: "There is no profile for this user"
               });

           }
           res.send(profile)
       } catch (err) {
           console.error(err);
           res.status(500).send('Server Error');
       }
   });

   //@route POST api/profile
   //@desc POST   Create/update user's profile
   //@access  private

   router.post("/", [auth, [
       check('status', 'required , cannot be empty').not().isEmpty(),
       check('skills', 'Skills is required').not().isEmpty()
   ]], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({
               errors: errors.array()
           });
       }
       const {
           company,
           website,
           location,
           bio,
           status,
           githubusername,
           skills,
           youtube,
           facebook,
           twitter,
           instagram,
           linkedin
       } = req.body
       //Build profile object
       const profileFields = {};
       profileFields.user = req.user.id;
       if (req.body.handle) profileFields.handle = req.body.handle;
       if (req.body.company) profileFields.company = req.body.company;
       if (req.body.website) profileFields.website = req.body.website;
       if (req.body.location) profileFields.location = req.body.location;
       if (req.body.bio) profileFields.bio = req.body.bio;
       if (req.body.status) profileFields.status = req.body.status;
       if (req.body.githubusername)
           profileFields.githubusername = req.body.githubusername;
       if (skills) {
           profileFields.skills = skills.split(',').map(skill =>
               skill.trim()
           );
       }
       profileFields.social = {};
       if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
       if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
       if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
       if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
       if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

       try {
           profile = await Profile.findOne({
               user: req.user.id
           });
           if (profile) {
               //UPDATE
               profile = await Profile.findOneAndUpdate({
                   user: req.user.id
               }, {
                   $set: profileFields
               }, {
                   new: true
               });
               return res.json(profile);
           }
           //CREAte
           profile = new Profile(profileFields);
           await profile.save();
           res.json(profile);


       } catch (err) {
           console.log(err);
           res.status(500).send('Server Error');
       }
   });


   //@route GET api/profile
   //@desc GET   Get all profiles
   //@access  public

   router.get("/", async (req, res) => {
       try {
           const profiles = await Profile.find().populate('user', ['avatar', 'name']);
           res.json(profiles);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   //@route GET api/profile/user/:user_id
   //@desc GET   Get profiles by user id
   //@access  public

   router.get("/user/:user_id", async (req, res) => {
       try {
           const profile = await Profile.findOne({
               user: req.params.id
           }).populate('user', ['avatar', 'name']);
           if (!profile) {
               return res.status(400).json({
                   msg: "There is no profile for this user"
               });
           }

       } catch (err) {
           console.error(err.message);
           if (err.kind == 'ObjectId') {
               return res.status(400).json({
                   msg: "There is no profile for this user"
               });
           }
           res.status(500).send('Server error');
       }
   });


   //@route DELETE api/profile
   //@desc DELETE   Get profiles ,users,posts
   //@access  Private
   router.delete("/", auth, async (req, res) => {
       try {
           //todo - remove users posts
           //remove profile
           await Profile.findOneAndRemove({
               user: req.user.id
           });

           //REmove the user
           await User.findOneAndRemove({
               id: req.user.id
           });
           res.json({
               msg: ' user removed/deleted'
           });
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   //@route PUT api/profile/experience
   //@desc PUT   Add profile experience
   //@access  Private

   router.put("/experience", [auth, [
       check('title', 'Title is required').not().isEmpty(),
       check('company', 'Company is required').not().isEmpty(),
       check('from', 'From date is required').not().isEmpty()
   ]], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({
               errors: errors.array()
           });
       }
       const {
           title,
           company,
           location,
           from,
           to,
           current,
           description
       } = req.body;

       const newExp = {
           title,
           company,
           location,
           from,
           to,
           current,
           description
       }

       try {
           const profile = await Profile.findOne({
               user: req.user.id
           });

           profile.experience.unshift(newExp);
           await profile.save();
           res.json(profile);
       } catch (err) {
           console.error(err.message);
           res.status(500).send("Server Error");
       }
   });


   //@route DELETE api/profile/experience/:exp_id
   //@desc DELETE   delete profile experience
   //@access  Private

   router.delete('/experience/:exp_id', auth, async (req, res) => {
       try {
           const profile = await Profile.findOne({
               user: req.user.id
           });

           //get remove index
           const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

           profile.experience.splice(removeIndex, 1);
           await profile.save();
           res.json(profile);

       } catch (err) {
           console.error(err.message);
           res.status(500).send("Server Error");

       }
   });



   //@route PUT api/profile/education
   //@desc PUT   Add profile education
   //@access  Private

   router.put("/education", [auth, [
       check('school', 'school is required').not().isEmpty(),
       check('degree', 'degree is required').not().isEmpty(),
       check('fieldofstudy', 'Field of study is required').not().isEmpty(),
       check('from', 'From date is required').not().isEmpty()
   ]], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({
               errors: errors.array()
           });
       }
       const {
           school,
           degree,
           fieldofstudy,
           from,
           to,
           current,
           description
       } = req.body;

       const newEdu = {
           school,
           degree,
           fieldofstudy,
           from,
           to,
           current,
           description
       }

       try {
           const profile = await Profile.findOne({
               user: req.user.id
           });

           profile.education.unshift(newEdu);
           await profile.save();
           res.json(profile);
       } catch (err) {
           console.error(err.message);
           res.status(500).send("Server Error");
       }
   });


   //@route DELETE api/profile/education/:edu_id
   //@desc DELETE   delete profile education
   //@access  Private

   router.delete('/education/:edu_id', auth, async (req, res) => {
       try {
           const profile = await Profile.findOne({
               user: req.user.id
           });

           //get remove index
           const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

           profile.education.splice(removeIndex, 1);
           await profile.save();
           res.json(profile);

       } catch (err) {
           console.error(err.message);
           res.status(500).send("Server Error");

       }
   });

   //@route GET api/profile/github/:username
   //@desc GET   get user repo from github
   //@access  public

   router.get("/github/:username", (req, res) => {
       try {
           const options = {
               url: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=${config.get('githubSecret')}`,
               method: 'GET',
               headers: {
                   'user-agent': 'node.js'
               }
           };
           request(options, (error, response, body) => {
               if (error) {
                   console.log(error);
               }
               if (response.statusCode !== 200) {
                   return res.status(404).json({
                       msg: "NO github username found"
                   })
               }
               res.json(JSON.parse(body));
           });

       } catch (err) {
           console.error(err.message);
           res.status(500).send("Server Error");

       }
   });




   module.exports = router;