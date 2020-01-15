const multer = require("multer");

const multerStorage = multer.memoryStorage();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: multerFilter
});

const uploadFiles = upload.single("images"); // limit to 10 images

exports.uploadImages = (req, res, next) => {
  uploadFiles(req, res, err => {
    if (err instanceof multer.MulterError) { // A Multer error occurred when uploading.
      if (err.code === "LIMIT_UNEXPECTED_FILE") { // Too many images exceeding the allowed limit
        // ...
        console.log("Too many images exceeding the allowed limit");
      }
    } else if (err) {
      // handle other errors
      console.log("handle other errors");
    }

    // Everything is ok.
    next();
  });
};
