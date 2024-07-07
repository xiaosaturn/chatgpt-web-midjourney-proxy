import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { isNotEmptyString } from './utils/is';
import FormData from 'form-data'

export const viggleProxyFileDo = async (req: Request, res: Response, next?: NextFunction) => {
    console.log('req.originalUrl', req.originalUrl);
    let API_BASE_URL = isNotEmptyString(process.env.OPENAI_API_BASE_URL)
        ? process.env.OPENAI_API_BASE_URL
        : 'https://api.aijuli.com'
    API_BASE_URL = process.env.VIGGLE_SERVER ?? API_BASE_URL
    if (req.file.buffer) {
        const fileBuffer = req.file.buffer;
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: req.file.originalname });
        try {
            let url = `${API_BASE_URL}${req.originalUrl}`;
            let responseBody = await axios.post(url, formData, {
                headers: {
                    Authorization: 'Bearer ' + (process.env.VIGGLE_KEY ?? process.env.OPENAI_API_KEY),
                    'Content-Type': 'multipart/form-data',
                }
            });
            res.json(responseBody.data);
        } catch (e) {
            res.status(400).json({ error: e });
        }
    } else {
        res.status(400).json({ 'error': 'uploader fail' });
    }
}