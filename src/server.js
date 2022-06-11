import express from "express";
import cors from "cors"; // give data
import fileUpload from "express-fileupload"; // take files req.files
import fs from "fs";
import path from "path";

let PORT = process.env.PORT || 5000;
let app = express();

app.use(express.json());
app.use(fileUpload());
app.use(cors());

import userRouter from "./routers/user.js";

app.use(userRouter);

app.use((error, req, res, next) => {
  if (error.status != 500) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message,
    });
  }

  fs.appendFileSync(
    path.join(process.cwd(), "src", "log.txt"),
    `${req.url}___${error.name}___${Date.now()}___${error.status}___${
      error.message
    }\n`
  );

  res.status(error.status).json({
    status: error.status,
    message: "InternalServerError",
  });

  process.exit();
});

app.listen(PORT, () => console.log(`server runnning ${PORT}`));
