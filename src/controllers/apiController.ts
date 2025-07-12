import { Request, Response } from 'express';
import axios from 'axios';
import { json } from 'stream/consumers';

export const getJoke = async (req: Request, res: Response) => {
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke',
        {
        headers: {
            Authorization: 'Bearer your-api-key-here',
            'Custom-Header': 'MyCustomValue'
        }
    });
    res.json(response.data);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch joke' });
  }
};


export const postExample = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', payload);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post data' });
  }
};
