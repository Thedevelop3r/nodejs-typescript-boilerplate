
import express from 'express'
import { Request, Response } from 'express';

const router = express.Router();


router.get('/:name', (req: Request, res: Response) => {
    const Name = req.params.name;
    res.json({ name: Name, parse: true })

})

export default router