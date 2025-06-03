import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import 'dotenv/config';

const app=express()
const PORT=process.env.PORT ;
app.use(cors());
app.use(express.json());


connectDB();
app.get('/', (req, res) => {
    res.send('API');
  });
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
  