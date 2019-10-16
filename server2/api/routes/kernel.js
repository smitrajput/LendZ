const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Kernel = require("../models/kernel");
const KernelAccess = require("../models/kernelAccess");
const ViewKey = require("../models/viewKey");
 
router.get("/", (req, res, next) => {
  Kernel.find({}, {"__v":0})
    // .select("name _id price")
    .exec()
    .then(docs => {
      console.log("From the database ", docs);
      const response = {
        result: docs
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


router.get("/lender/:lender/", (req, res, next) => {
    var lender = req.params.lender;
    console.log("lender on server ", lender);
    Kernel.find({lender:lender}, {"__v":0})
      // .select("name _id price")
      .exec()
      .then(docs => {
        console.log("From the database ", docs);
        const response = {
          result: docs
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
  var kernel_object = {};
  for (const key in req.body) {
    console.log("key ", key);
    kernel_object[key] = req.body[key];
  }
  console.log("kernel object ", kernel_object);
  kernel_object["_id"] = new mongoose.Types.ObjectId();
  const kernel = new Kernel(kernel_object);

  kernel
    .save()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "kernel Created Successfully ",
        kernelCreated:result
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        error: error
      });
    });
});


router.get("/:kernelHash", (req, res, next) => {
  const kernel_hash = req.params.kernelHash;
  Kernel.find({hash:kernel_hash}, {"__v":0})
    // .select("_id hash lender borrower ")
    .exec()
    .then(doc => {
      console.log("From the database ", doc);
      if (doc) {
        res.status(200).json({
          kernel: doc
        });
      } else {
        res.status(404).json({
          message: "No entry found for the provided kernel hash"
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

router.delete("/delete", (req, res, next) => {
  // const kernel_hash = req.params.kernelHash;
  Kernel.remove({})
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

router.delete("/:kernelHash", (req, res, next) => {
  const kernel_hash = req.params.kernelHash;
  Kernel.remove({ hash: kernel_hash })
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

router.patch("/:kernelHash", (req, res, next) => {
  const kernel_hash = req.params.kernelHash;
  const updateOps = {};

  console.log("request body : ", req.body);

  for (const key in req.body) {
    updateOps[key] = req.body[key];
  }
  Kernel.update({ hash: kernel_hash }, { $set: updateOps })
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

router.post("/viewKey", (req, res, next) => {
 
    console.log(req.body);
    const view_key = new ViewKey({
        _id:new mongoose.Types.ObjectId(),
        kernel_hash:req.body.kernel_hash,
        view_key:req.body.view_key
    });
  
    view_key
      .save()
      .then(result => {
        console.log(result);
        res.status(200).json({
          message: "view key stored Successfully ",
          viewKey:result
        });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          error: error
        });
      });
  });

  router.get("/viewKey/:kernelHash/", (req, res, next) => {
    const kernel_hash = req.params.kernelHash;
    ViewKey.findOne({kernel_hash:kernel_hash}, {"__v":0})
      // .select("_id hash lender borrower ")
      .exec()
      .then(doc => {
        console.log("From the database ", doc);
        if (doc) {
          res.status(200).json({
            result:doc
          });
        } else {
          res.status(404).json({
            message: "No entry found for the provided kernel hash"
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

  router.post("/accessGranted", (req, res, next) => {
 
    console.log(req.body);
    const kernel_hash = req.body.kernelHash;
    const borrower_address = req.body.borrower;
    KernelAccess.update({ kernel_hash: kernel_hash, borrower_address: borrower_address }, { status: "granted" })
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

router.get("/accessRequested/:kernelHash/", (req, res, next) => {
    const kernel_hash = req.params.kernelHash;
    KernelAccess.find({kernel_hash:kernel_hash}, {"__v":0})
      // .select("_id hash lender borrower ")
      .exec()
      .then(doc => {
        console.log("From the database ", doc);
        if (doc) {
          res.status(200).json({
            kernel_access: doc
          });
        } else {
          res.status(404).json({
            message: "No entry found for the provided kernel hash"
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

router.get("/accessRequested/:kernelHash/:borrower", (req, res, next) => {
    const kernel_hash = req.params.kernelHash;
    const borrower_address = req.params.borrower;
    KernelAccess.find({kernel_hash:kernel_hash, borrower_address:borrower_address}, {"__v":0})
      // .select("_id hash lender borrower ")
      .exec()
      .then(doc => {
        console.log("From the database ", doc);
        if (doc) {
          res.status(200).json({
            kernel: doc
          });
        } else {
          res.status(404).json({
            message: "No entry found for the provided kernel hash"
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

module.exports = router;

