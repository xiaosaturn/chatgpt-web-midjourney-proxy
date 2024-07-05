import { getUserById } from '../db/userModel'
import { Request, Response, NextFunction } from 'express';

exports.getUserByIdService = async (req: Request, res: Response, next: NextFunction) => {
    console.log('req:', req.query)
    const user = await getUserById(req.query.userId)
    res.send({
        msg: 'success',
        code: '200',
        data: user
    })
}