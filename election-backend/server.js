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
        phase: 'Pre-Election',
        title: 'Announcement of Election',
        status: 'done',
        label: 'Completed',
        desc: 'The Election Commission announces the election schedule, including dates for voting and results.',
        details: ['Election dates are notified', 'Model Code of Conduct comes into effect', 'Political parties prepare their manifestos'],
        order: 1
      },
      {
        phase: 'Pre-Election',
        title: 'Nomination Filing',
        status: 'done',
        label: 'Completed',
        desc: 'Candidates file their nominations with the Election Commission within the specified period.',
        details: ['Candidates submit nomination papers', 'Scrutiny of nominations takes place', 'Withdrawal of candidatures allowed'],
        order: 2
      },
      {
        phase: 'Campaign',
        title: 'Campaign Period',
        status: 'active',
        label: 'In Progress',
        desc: 'Candidates campaign across constituencies to garner support from voters.',
        details: ['Public rallies and meetings held', 'Door-to-door campaigns conducted', 'Media advertisements released'],
        order: 3
      },
      {
        phase: 'Voting',
        title: 'Voting Day',
        status: 'upcoming',
        label: 'Upcoming',
        desc: 'Citizens cast their votes at designated polling stations across the country.',
        details: ['Polling stations open 7am to 6pm', 'Voters must carry valid ID proof', 'VVPAT machines verify votes'],
        order: 4
      },
      {
        phase: 'Post-Election',
        title: 'Counting & Results',
        status: 'upcoming',
        label: 'Upcoming',
        desc: 'Votes are counted and results are declared by the Election Commission.',
        details: ['Counting begins at 8am', 'Postal ballots counted first', 'Results declared constituency-wise'],
        order: 5
      }
    ]);

    // Seed Glossary
    await Glossary.create([
      { term: 'Ballot', def: 'A device used to cast votes in an election, which may be a paper ballot or electronic voting machine (EVM).' },
      { term: 'Constituency', def: 'A geographic area whose residents are represented by an elected official in the legislature.' },
      { term: 'Electoral Roll', def: 'The official list of people entitled to vote in an election, also known as the voters list.' },
      { term: 'Mandate', def: 'The authority granted by voters to an elected representative to govern and make decisions on their behalf.' },
      { term: 'Nomination', def: 'The formal process by which a candidate is proposed to stand for election in a constituency.' },
      { term: 'Polling Station', def: 'A designated location where voters go to cast their ballots on election day.' },
      { term: 'EVM', def: 'Electronic Voting Machine — a device used in Indian elections to record votes electronically, replacing paper ballots.' },
      { term: 'NOTA', def: 'None of the Above — an option on the ballot that allows voters to reject all candidates contesting from a constituency.' },
      { term: 'Model Code of Conduct', def: 'A set of guidelines issued by the Election Commission to regulate political parties and candidates during elections.' },
      { term: 'Affidavit', def: 'A sworn statement filed by candidates declaring their criminal record, assets, liabilities and educational qualifications.' }
    ]);

    // Seed Quiz
    await Quiz.create([
      {
        q: 'What is the minimum age to vote in India?',
        opts: ['16 years', '18 years', '21 years', '25 years'],
        ans: '18 years',
        exp: 'In India, citizens must be at least 18 years old to be eligible to vote as per Article 326 of the Constitution.',
        order: 1
      },
      {
        q: 'Which body conducts elections in India?',
        opts: ['Parliament of India', 'Supreme Court', 'Election Commission of India', 'President of India'],
        ans: 'Election Commission of India',
        exp: 'The Election Commission of India is an autonomous constitutional authority responsible for administering elections in India.',
        order: 2
      },
      {
        q: 'What does EVM stand for?',
        opts: ['Electronic Voting Machine', 'Electoral Verification Method', 'Election Vote Monitor', 'Electronic Verification Machine'],
        ans: 'Electronic Voting Machine',
        exp: 'EVM stands for Electronic Voting Machine. It has been used in Indian elections since 1982 to record votes electronically.',
        order: 3
      },
      {
        q: 'How often are Lok Sabha elections held in India?',
        opts: ['Every 3 years', 'Every 4 years', 'Every 5 years', 'Every 6 years'],
        ans: 'Every 5 years',
        exp: 'Lok Sabha elections are held every 5 years unless the house is dissolved earlier by the President on the advice of the Prime Minister.',
        order: 4
      },
      {
        q: 'What does NOTA stand for in Indian elections?',
        opts: ['None of the Above', 'No Official Tally Available', 'National Order of Total Abstention', 'New Option for Total Abstention'],
        ans: 'None of the Above',
        exp: 'NOTA (None of the Above) was introduced in 2013 and allows voters to reject all candidates on the ballot.',
        order: 5
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
        glossary: 10,
        quiz: 5,
        adminEmail: 'admin@election.com',
        adminPassword: 'Admin@123'
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