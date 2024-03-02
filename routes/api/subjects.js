const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Subject = require("../../models/Subject");

// Load validation
const validateSubjectInput = require("../../validation/subjectValidation");

// @route   GET api/subjects
// @desc    Get all subjects
// @access  Private
router.get("/", async (req, res) => {
  const errors = {};

  try {
    const subjects = await Subject.find().populate("subjects", [
      "id",
      "name",
      "isMajor",
      "isMinor",
    ]);
    if (!subjects) {
      errors.nosubjects = "There are currently no subjects";
      return res.status(404).json();
    }
    res.json(subjects);
  } catch (err) {
    res.status(404).json({ subjects: "Error retrieving subjects" });
  }
});

// @route   POST api/subjects
// @desc    Create or edit a subject
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const results = [];

    for (let i = 0; i < req.body.subjects.length; i++) {
      const subject = req.body.subjects[i];

      // Extract fields from subject
      const { id, name, isMajor, isMinor, isCourse } = subject;

      // Create an object with the fields you want to save
      const subjectFields = {
        id,
        name,
        isMajor,
        isMinor,
        isCourse,
        // Add any other fields you want to save
      };

      try {
        const existingSubject = await Subject.findOne({ _id: subject._id });

        if (existingSubject) {
          const updatedSubject = await Subject.findOneAndUpdate(
            { _id: subject._id },
            { $set: subjectFields },
            { new: true }
          );
          results.push(updatedSubject);
        } else {
          const newSubject = await new Subject(subjectFields).save();
          results.push(newSubject);
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
        return; // Stop the loop if an error occurs
      }
    }

    res.json(results);
  }
);


// @route   DELETE api/subjects
// @desc    Delete a subject by id
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Subject.findOneAndRemove({ id: req.body.id }).then(() =>
      res.json({ success: true })
    );
  }
);

module.exports = router;
