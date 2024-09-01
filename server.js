import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'taskDB';
let collection;

async function main() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    collection = db.collection('tasks');

    // Fetch tasks
    app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await collection.find({}).toArray();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
    });

    // Add a task
    app.post('/api/tasks', async (req, res) => {
      const { task } = req.body;

      if (!task) {
        return res.status(400).json({ error: 'Task is required' });
      }

      try {
        const result = await collection.insertOne({ task });
        res.json(result.ops[0]); // Respond with the newly added task
      } catch (error) {
        res.status(500).json({ error: 'Failed to add task' });
      }
    });

    // Update a task
    app.put('/api/tasks/:id', async (req, res) => {
      const { id } = req.params;
      const { task } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      try {
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { task } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
      }
    });

    // Delete a task
    app.delete('/api/tasks/:id', async (req, res) => {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
      }
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

main();
