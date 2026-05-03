require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Trust reverse proxy for accurate rate-limiting IPs (Render/Railway)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet());

// Compress responses (gzip)
app.use(compression());

// Enable CORS securely based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(cookieParser());

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/analytics', require('./routes/analyticsRoutes'));

// Temporary seed route - visit /api/seed-now in browser to seed database
app.get('/api/seed-now', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Dynamically load models
    const Timeline = require('./models/Timeline');
    const Glossary = require('./models/Glossary');
    const Quiz = require('./models/Quiz');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // Clear existing data
    await Timeline.deleteMany();
    await Glossary.deleteMany();
    await Quiz.deleteMany();

    // Seed Timeline
    await Timeline.create([
      {
        title: 'Announcement of Election',
        description: 'The Election Commission announces the election schedule, including dates for voting and results.',
        date: 'Step 1',
        order: 1
      },
      {
        title: 'Nomination Filing',
        description: 'Candidates file their nominations with the Election Commission within the specified period.',
        date: 'Step 2',
        order: 2
      },
      {
        title: 'Campaign Period',
        description: 'Candidates campaign across constituencies to garner support from voters.',
        date: 'Step 3',
        order: 3
      },
      {
        title: 'Voting Day',
        description: 'Citizens cast their votes at designated polling stations across the country.',
        date: 'Step 4',
        order: 4
      },
      {
        title: 'Counting & Results',
        description: 'Votes are counted and results are declared by the Election Commission.',
        date: 'Step 5',
        order: 5
      }
    ]);

    // Seed Glossary
    await Glossary.create([
      {
        term: 'Ballot',
        definition: 'A device used to cast votes in an election, which may be a paper ballot or electronic voting machine.',
        category: 'Voting'
      },
      {
        term: 'Constituency',
        definition: 'A geographic area whose residents are represented by an elected official.',
        category: 'Structure'
      },
      {
        term: 'Electoral Roll',
        definition: 'The official list of people entitled to vote in an election, also called the voters list.',
        category: 'Voting'
      },
      {
        term: 'Mandate',
        definition: 'The authority granted by voters to an elected representative to act on their behalf.',
        category: 'Governance'
      },
      {
        term: 'Nomination',
        definition: 'The formal process by which a candidate is proposed to stand for election.',
        category: 'Process'
      },
      {
        term: 'Polling Station',
        definition: 'A designated location where voters go to cast their ballots on election day.',
        category: 'Voting'
      }
    ]);

    // Seed Quiz
    await Quiz.create([
      {
        question: 'What is the minimum age to vote in India?',
        options: ['16', '18', '21', '25'],
        correctAnswer: '18',
        explanation: 'In India, citizens must be at least 18 years old to be eligible to vote.',
        difficulty: 'easy'
      },
      {
        question: 'Which body conducts elections in India?',
        options: ['Parliament', 'Supreme Court', 'Election Commission of India', 'President'],
        correctAnswer: 'Election Commission of India',
        explanation: 'The Election Commission of India is an autonomous constitutional authority responsible for conducting elections.',
        difficulty: 'easy'
      },
      {
        question: 'What does EVM stand for?',
        options: ['Electronic Voting Machine', 'Electoral Verification Method', 'Election Vote Monitor', 'Electronic Verification Machine'],
        correctAnswer: 'Electronic Voting Machine',
        explanation: 'EVM stands for Electronic Voting Machine, used in Indian elections since 1982.',
        difficulty: 'easy'
      },
      {
        question: 'How often are Lok Sabha elections held in India?',
        options: ['Every 3 years', 'Every 4 years', 'Every 5 years', 'Every 6 years'],
        correctAnswer: 'Every 5 years',
        explanation: 'Lok Sabha elections are held every 5 years unless the house is dissolved earlier.',
        difficulty: 'medium'
      },
      {
        question: 'What is NOTA in Indian elections?',
        options: ['None of the Above', 'No Official Tally Available', 'National Order of Total Abstention', 'New Option for Total Abstention'],
        correctAnswer: 'None of the Above',
        explanation: 'NOTA (None of the Above) allows voters to reject all candidates on the ballot.',
        difficulty: 'medium'
      }
    ]);

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin@election.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await User.create({
        name: 'Admin',
        email: 'admin@election.com',
        password: hashedPassword,
        role: 'admin'
      });
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        timelines: 5,
        glossary: 6,
        quiz: 5,
        admin: 'admin@election.com / Admin@123'
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});