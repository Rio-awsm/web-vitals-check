// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const reportSchema = new mongoose.Schema({
  url: String,
  performance: Number,
  accessibility: Number,
  bestPractices: Number,
  seo: Number,
  timestamp: { type: Date, default: Date.now },
  loadTime: Number,
  resourceSize: Number,
  requestCount: Number
});

const Report = mongoose.model('Report', reportSchema);

app.post('/api/check', async (req, res) => {
  const { url } = req.body;
  
  try {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse(url, options);
    
   
    const audits = runnerResult.lhr.audits;
    const totalBlockingTime = audits['total-blocking-time']?.numericValue || 0;
    const totalByteWeight = audits['total-byte-weight']?.numericValue || 0;
    const requestCount = audits['network-requests']?.details?.items?.length || 0;

    const report = new Report({
      url,
      performance: (runnerResult.lhr.categories.performance?.score || 0) * 100,
      accessibility: (runnerResult.lhr.categories.accessibility?.score || 0) * 100,
      bestPractices: (runnerResult.lhr.categories['best-practices']?.score || 0) * 100,
      seo: (runnerResult.lhr.categories.seo?.score || 0) * 100,
      loadTime: totalBlockingTime,
      resourceSize: totalByteWeight,
      requestCount: requestCount
    });
    
    await report.save();
    await chrome.kill();
    
    res.json(report);
  } catch (error) {
    console.error('Performance check error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort('-timestamp');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));