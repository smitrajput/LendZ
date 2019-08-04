const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Position = require("../models/position");

router.get("/", (req, res, next) => {
  Position.find({}, {"__v":0})
    // .select("name _id price")
    .exec()
    .then(docs => {
      console.log("From the database ", docs);
      const response = {
        count: docs.length,
        positions: docs
      };
      if (docs) {
        res.status(200).json(response);
      } else {
        res.status(404).json({
          message: "No entries found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", (req, res, next) => {
 
  console.log(req.body);
  var position_object = {};
  for (const key in req.body) {
    console.log("key ", key);
    position_object[key] = req.body[key];
  }
  console.log("position object ", position_object);
  position_object["_id"] = new mongoose.Types.ObjectId();
  const position = new Position(position_object);

  position
    .save()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "position Created Successfully ",
        positionCreated:result
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        error: error
      });
    });
});


router.get("/:positionHash", (req, res, next) => {
  const position_hash = req.params.positionHash;
  Position.find({hash:position_hash}, {"__v":0})
    // .select("_id hash lender borrower ")
    .exec()
    .then(doc => {
      console.log("From the database ", doc);
      if (doc) {
        res.status(200).json({
          position: doc
        });
      } else {
        res.status(404).json({
          message: "No entry found for the provided position hash"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:positionHash", (req, res, next) => {
  const position_hash = req.params.positionHash;
  Position.remove({ hash: position_hash })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.patch("/:positionHash", (req, res, next) => {
  const position_hash = req.params.positionHash;
  const updateOps = {};

  console.log("request body : ", req.body);

  for (const key in req.body) {
    updateOps[key] = req.body[key];
  }
  Position.update({ hash: position_hash }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
module.exports = router;
