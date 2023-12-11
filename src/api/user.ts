// userRoutes.ts
import { Request, Response } from 'express';
import { create_user, get_user, delete_user, update_user } from '../user';
const { hashPassword, compare } = require('../hash');

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUser ,LoginUser,UpdateUser,DeleteUser} from './schema/request';

const { formatError } = require('../api/helper/api_service')


const fetchUser = (req, res) => {
  
  const user_id = req.user["_id"]

  get_user(user_id).then((user_data) => {

    if(! user_data)
      res.send("User does not exists")

    delete user_data["password"]
    res.send(user_data)  

  })
};


const createUser = async (req: Request, res: Response) => {

  const errors = await validate(plainToClass(CreateUser, req.body));
  
  if (errors.length > 0)
  return res.status(400).json({ errors: formatError(errors) });

  const body   = req.body;

  hashPassword(body["password"]).then((result) => {

    body['password'] = result;
    create_user(body);

  });

  res.send("User added successfully");

};

const deleteUser = async(req: any, res: any) => {

  const errors = await validate(plainToClass(DeleteUser,req.body));

  if (errors.length > 0)
    return res.status(400).json({ errors: formatError(errors) });


  const secret  = req.body["password"];
  const user_id = req.user["_id"];

  get_user(user_id).then((user_data) => {

    const hashed = user_data["password"];

    compare(secret, hashed).then((result) => {

      if (!result)
        res.send("Cant delete user, Incorrect Password")

      delete_user(user_id)
      res.end("User deleted Seccesfully")


    });
  })
}


const updateUser = async(req: any, res: any) => {

  const errors = await validate(plainToClass(UpdateUser,req.body));

  if (errors.length > 0)
    return res.status(400).json({ errors: formatError(errors) });

  const body    = req.body;
  const user_id = req.user["_id"]

  update_user(body, user_id).then((result) => {
    res.send(result);

  });
};

module.exports = { fetchUser, createUser, deleteUser, updateUser }