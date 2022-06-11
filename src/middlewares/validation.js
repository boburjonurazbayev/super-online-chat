import { loginScheme, registerScheme } from "../utils/validation.js";
import {ValidationError} from "../utils/error.js"

export default (req, res, next) => {
  try {
    if (req.url == "/login") {
        let { error } = loginScheme.validate(req.body);
        if (error) throw error;
      }
    
      if (req.url == "/register") {
        req.body.userData = JSON.parse(req.body.userData)
        req.body.userData.avatar = req.files.avatar

        let { error } = registerScheme.validate(req.body.userData);
        
        if (error) throw error;
      }
      return next()
  } catch (error) {
      return next(new ValidationError(401, error.message))
  }
};
