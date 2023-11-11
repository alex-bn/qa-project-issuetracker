"use strict";
const { move } = require("../server");
const IssueModel = require("../db/issue");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      const query = req.query;

      try {
        const issues = await IssueModel.find({ ...query, project });
        res.json(issues);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .post(async function (req, res) {
      try {
        let project = req.params.project;

        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
          return res.status(400).json({ error: "required field(s) missing" });
        }

        const issue = new IssueModel({ ...req.body, project });
        await issue.save();

        res.json(issue);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .put(async function (req, res) {
      const { _id, ...updateFields } = req.body;

      if (!_id) {
        res.json({ error: "missing _id" });
      } else if (Object.keys(updateFields).length === 0) {
        res.json({ error: "no update field(s) sent", _id });
      } else {
        try {
          const filteredUpdateFields = Object.fromEntries(
            Object.entries(updateFields).filter(([key, value]) => value !== "")
          );

          if (Object.keys(filteredUpdateFields).length === 0) {
            return res.json({ error: "no valid update field(s) sent", _id });
          }

          filteredUpdateFields.updated_on = new Date();

          const issue = await IssueModel.findByIdAndUpdate(_id, filteredUpdateFields, { new: true });

          if (!issue) {
            return res.status(404).json({ error: "could not update", _id });
          }

          res.json({ result: "successfully updated", _id });
        } catch (error) {
          console.error(error);
          // res.status(500).json({ error: "could not update", _id });
        }
      }
    })

    .delete(async function (req, res) {
      const { _id } = req.body;

      try {
        if (!_id) {
          return res.status(400).json({ error: "missing _id" });
        }

        const issue = await IssueModel.findByIdAndDelete(_id);

        if (!issue) {
          return res.status(404).json({ error: "could not delete", _id });
        }

        return res.json({ result: "successfully deleted", _id });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "could not delete", _id });
      }
    });
};
