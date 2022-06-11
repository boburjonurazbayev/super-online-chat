import { read, write } from "../utils/model.js";
import {
  AuthorizationError,
  InternalServerError,
  ValidationError,
} from "../utils/error.js";
import sha256 from "sha256";
import jwt from "../utils/jwt.js";
import path from "path";

const API = "http://localhost:5000";

const LOGIN = (req, res, next) => {
  try {
    let { userName, password } = req.body;
    let users = read("user");
    let user = users.find(
      (user) => user.userName == userName && user.password == sha256(password)
    );

    if (!user) {
      return next(new AuthorizationError(401, "wrong username or password"));
    }

    delete user.password;

    res.status(200).json({
      status: 200,
      message: "succes",
      token: jwt.sign({ userId: user.userId }),
      data: user,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const REGISTER = (req, res, next) => {
  try {
    let users = read("user");
    let userData = req.body.userData;

    let userId = users.length ? users.at(-1).userId + 1 : 1;

    if (userData.avatar?.mimetype?.split("/")[0] == `image`) {
      let avatar = Date.now() + userData.avatar.name.replace(/\s/g, "");
      userData.avatar.mv(path.join(process.cwd(), "src", "uploads", avatar));

      userData.avatar = API + "/view/" + avatar;
    } else {
      return new ValidationError(415, "Unsupported Media Type");
    }

    let user = users.find((user) => user.userName == userData.userName);

    if (user) {
      return next(
        new AuthorizationError(401, "This username is already taken")
      );
    }
    userData.password = sha256(userData.password)
    userData.userId = userId;
    users.push(userData);
    write("user", users);

    res.status(201).json({
      status: 201,
      message: "succes",
      token: jwt.sign({ userId: userId }),
      userId: userId,
    });
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const GET = (req, res, next) => {
  try {
    let messages = read("message");
    let users = read("user");

    delete users.map((user) => {
      delete user.password;
      return user;
    });

    if (req.url == "/users") {
      res.status(200).json({
        status: 200,
        message: "succes",
        data: users,
      });
    }

    if (req.url == "/view/" + req.params.fileName) {
      res.sendFile(
        path.join(process.cwd(), "src", "uploads", req.params.fileName)
      );
    }

    if (req.url == "/download/" + req.params.fileName) {
      res.download(
        path.join(process.cwd(), "src", "uploads", req.params.fileName)
      );
    }

    if (req.url == "/messages") {
      res.status(200).json({
        status: 200,
        message: "succes",
        data: messages,
      });
    }
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

const POST = (req, res, next) => {
  try {
    if (req.url == "/messages") {
      let messages = read("message");
      let users = read("user");
      let userId = req.body.userId;
      let file = req?.files;
      let user = users.find((user) => user.userId == userId);
      delete user.password;

      function getTime() {
        let today = new Date();
        let hours = today.getHours();
        let minutes = today.getMinutes();

        hours = hours < 10 ? `0${hours}` : hours;
        minutes = minutes < 10 ? `0${minutes}` : minutes;

        return hours + " : " + minutes;
      }

      let newMessage = {
        messageId: messages.length ? messages.at(-1).messageId + 1 : 1,
        message: req.body.message,
        date: getTime(),
        file: {},
        user: user,
      };

      if (file && file.file.mimetype.split("/")[0] == "image") {
        let fileName = Date.now() + file.file.name.replace(/\s/g, "");
        file.file.mv(path.join(process.cwd(), "src", "uploads", fileName));
        newMessage.file.view = API + "/view/" + fileName;
        newMessage.file.download = API + "/download/" + fileName;
        newMessage.file.name = file.file.name;
      }

      messages.push(newMessage);
      write("message", messages);

      res.status(201).json({
        status: 201,
        message: "succes",
        data: messages,
      });
    }
  } catch (error) {
    return next(new InternalServerError(500, error.message));
  }
};

export default { LOGIN, REGISTER, GET, POST };
