const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '../.env' });

// Load models
const Timeline = require('../models/Timeline');
const Step = require('../models/Step');
const Glossary = require('../models/Glossary');
const Quiz = require('../models/Quiz');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const timelineData = [
  { order: 1, phase: "Phase 1", title: "Candidate Filing & Eligibility", status: "done", label: "Completed", desc: "Candidates declare intent and file official paperwork.", details: ["Age, citizenship, residency requirements.", "Filing fees or petition signatures.", "Party vetting.", "Deadlines set by election law."] },
  { order: 2, phase: "Phase 2", title: "Primary Elections & Caucuses", status: "done", label: "Completed", desc: "Parties choose nominees through internal contests.", details: ["Primary = secret ballot. Caucus = public grouping.", "Open vs closed primaries.", "Delegates awarded proportionally or winner-take-all."] },
  { order: 3, phase: "Phase 3", title: "Party Conventions & Nominations", status: "done", label: "Completed", desc: "Delegates officially nominate the presidential candidate.", details: ["Ratification of primary winner.", "VP pick announced.", "Party platform finalized.", "Nominee acceptance speech."] },
  { order: 4, phase: "Phase 4", title: "General Campaign Period", status: "active", label: "In Progress", desc: "Nominees campaign nationwide — rallies, debates, advertising.", details: ["Presidential debates.", "Billions raised and spent.", "Super PACs.", "Voter registration drives peak."] },
  { order: 5, phase: "Phase 5", title: "Early Voting & Absentee Ballots", status: "upcoming", label: "Upcoming", desc: "Many states allow voting weeks before Election Day.", details: ["Mail-in ballots.", "In-person early voting.", "State-specific rules.", "Military/overseas accommodations."] },
  { order: 6, phase: "Phase 6", title: "Election Day", status: "upcoming", label: "Upcoming", desc: "Official date when polling places open across the country.", details: ["Tuesday after first Monday in November.", "Polls 6AM–8PM.", "Voters in line at close must be allowed to vote.", "Poll observers."] },
  { order: 7, phase: "Phase 7", title: "Vote Counting & Certification", status: "upcoming", label: "Upcoming", desc: "Ballots counted, audited, and certified by state authorities.", details: ["Provisional/mail-in verification.", "Automatic recounts.", "State canvassing boards.", "Legal challenges possible."] },
  { order: 8, phase: "Phase 8", title: "Electoral College & Inauguration", status: "upcoming", label: "Upcoming", desc: "Electors cast formal votes; winner is inaugurated.", details: ["Electors meet in December.", "Congress counts in January.", "Inauguration January 20th.", "Peaceful transfer of power."] }
];

const stepsData = [
  { stepNumber: 1, phase: "PHASE 1 — ELIGIBILITY", title: "Candidate Declares & Files", body: "Before a race begins, a candidate must officially declare their intention to run and submit paperwork to the relevant election authority. This includes proving eligibility — meeting age, citizenship, and residency requirements set by law.", fact: "Filing deadlines are legally fixed — missing them disqualifies a candidate" },
  { stepNumber: 2, phase: "PHASE 2 — PRIMARIES", title: "Parties Select Their Nominees", body: "Each political party holds a primary election or caucus. Voters within the party choose their preferred candidate. Delegates are awarded based on results, ultimately determining the party's nominee.", fact: "Primaries can be open (anyone votes) or closed (party members only)" },
  { stepNumber: 3, phase: "PHASE 3 — CONVENTION", title: "Official Nomination at Convention", body: "Delegates gathered at the party's national convention formally vote to nominate the primary winner. The nominee selects a running mate and delivers an acceptance speech outlining their vision to the nation.", fact: "Superdelegates can vote for any candidate at Democratic conventions" },
  { stepNumber: 4, phase: "PHASE 4 — CAMPAIGN", title: "The General Election Campaign", body: "Nominees from all parties campaign across the country — holding rallies, running advertisements, participating in televised debates, and building ground operations to mobilize voters.", fact: "Federal law limits direct donations to campaigns, but PACs have no limits" },
  { stepNumber: 5, phase: "PHASE 5 — REGISTRATION", title: "Voter Registration Deadlines", body: "Citizens must be registered to vote before deadlines set by each state. Some states offer same-day registration; others require weeks in advance. You must be 18 and a citizen to vote in federal elections.", fact: "15 states and D.C. offer automatic voter registration" },
  { stepNumber: 6, phase: "PHASE 6 — EARLY VOTING", title: "Absentee & Early Voting Opens", body: "Most states allow voting before Election Day — by mail or in-person at early voting locations. This reduces congestion and increases accessibility for working voters and those with disabilities.", fact: "Over 100 million Americans voted early in the 2020 election" },
  { stepNumber: 7, phase: "PHASE 7 — ELECTION DAY", title: "Polls Open Across the Nation", body: "On the first Tuesday after the first Monday in November, polling stations open nationwide. Voters present ID, receive their ballot, vote privately, and submit it. Any voter in line at closing must be allowed to vote.", fact: "Election Day is not a federal holiday — some states have made it one" },
  { stepNumber: 8, phase: "PHASE 8 — CERTIFICATION", title: "Count, Certify & Inaugurate", body: "After polls close, votes are counted. States certify results within weeks. In December, the Electoral College formally elects the President. Congress counts electoral votes in January. Inauguration is January 20th.", fact: "A candidate needs 270 of 538 Electoral College votes to win" }
];

const glossaryData = [
  { term: "Electoral College", def: "538 electors formally elect the President. Each state gets electors equal to its Congressional delegation. 270 needed to win." },
  { term: "Primary Election", def: "Party election to select its nominee. Can be open to all voters or closed to registered party members only." },
  { term: "Caucus", def: "Local party gathering where members publicly express candidate preference, often by physically grouping together." },
  { term: "Delegate", def: "Party representative who attends convention and votes to nominate the presidential candidate based on primary results." },
  { term: "Gerrymandering", def: "Drawing district boundaries to favor one political party. Named after Governor Elbridge Gerry whose 1812 district looked like a salamander." },
  { term: "Absentee Ballot", def: "Ballot cast by mail or deposited before Election Day by voters who cannot attend a polling place in person." },
  { term: "Provisional Ballot", def: "Cast when a voter's eligibility is in question. Set aside and counted only after eligibility is verified." },
  { term: "Swing State", def: "State where neither major party dominates, making it a key campaign target. Also called a battleground state." },
  { term: "Super PAC", def: "Independent political committee that raises unlimited funds from any source but cannot directly coordinate with campaigns." },
  { term: "Ballot Initiative", def: "Citizens propose legislation directly to voters by collecting enough petition signatures, bypassing the legislature." },
  { term: "Filibuster", def: "Senate tactic prolonging debate to block a vote. Ending it requires 60 votes (cloture)." },
  { term: "Ranked-Choice Voting", def: "Voters rank candidates by preference. Last-place candidate eliminated and votes redistributed until a majority winner emerges." }
];

const quizData = [
  { order: 1, q: "How many Electoral College votes does a presidential candidate need to win?", opts: ["269", "270", "271", "300"], ans: "270", exp: "A candidate needs 270 of 538 electoral votes — a simple majority — to win the presidency." },
  { order: 2, q: "What is a caucus?", opts: ["A mail-in voting system", "A public meeting where voters group by preference", "A type of ballot initiative", "A party fundraising event"], ans: "A public meeting where voters group by preference", exp: "A caucus is a local gathering where party members publicly express their candidate preference, often by physically grouping together." },
  { order: 3, q: "On what day are U.S. federal general elections held?", opts: ["First Monday in November", "First Tuesday in November", "Tuesday after first Monday in November", "Second Tuesday in November"], ans: "Tuesday after first Monday in November", exp: "Set by federal law since 1845." },
  { order: 4, q: "What is gerrymandering?", opts: ["Voter intimidation at polls", "Manipulating district boundaries for political advantage", "Casting multiple votes illegally", "A recount process"], ans: "Manipulating district boundaries for political advantage", exp: "Named after Governor Elbridge Gerry, whose 1812 district resembled a salamander." },
  { order: 5, q: "What is a provisional ballot?", opts: ["An early in-person ballot", "A ballot cast when eligibility is questioned", "A mail-in ballot", "A ballot used in runoff elections"], ans: "A ballot cast when eligibility is questioned", exp: "Provisional ballots are set aside and counted only after voter eligibility is verified." },
  { order: 6, q: "In a closed primary, who can vote?", opts: ["Any registered voter", "Only registered party members", "Any citizen 18 or older", "Only party delegates"], ans: "Only registered party members", exp: "Closed primaries restrict voting to party members. Open primaries allow any registered voter." },
  { order: 7, q: "How many total Electoral College votes exist?", opts: ["435", "500", "538", "560"], ans: "538", exp: "435 for House seats + 100 for Senate seats + 3 for D.C. (added by the 23rd Amendment) = 538." },
  { order: 8, q: "What does a Super PAC do?", opts: ["Runs candidates directly", "Raises unlimited funds for independent political spending", "Registers voters", "Organizes conventions"], ans: "Raises unlimited funds for independent political spending", exp: "Super PACs cannot directly coordinate with the campaigns they support." },
  { order: 9, q: "On what date is the U.S. President inaugurated?", opts: ["January 1", "January 15", "January 20", "February 1"], ans: "January 20", exp: "The 20th Amendment set January 20th as Inauguration Day, reducing the lame-duck period." },
  { order: 10, q: "What is ranked-choice voting?", opts: ["Voting by candidate height order", "Ranking candidates so votes redistribute until a majority winner emerges", "Only top candidates advance", "Counting votes by district rank"], ans: "Ranking candidates so votes redistribute until a majority winner emerges", exp: "Last-place candidate eliminated and their voters' second choices redistributed until a majority winner is found." }
];

// Import into DB
const importData = async () => {
  try {
    await Timeline.create(timelineData);
    await Step.create(stepsData);
    await Glossary.create(glossaryData);
    await Quiz.create(quizData);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Timeline.deleteMany();
    await Step.deleteMany();
    await Glossary.deleteMany();
    await Quiz.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide a valid argument (-i to import, -d to destroy)');
  process.exit();
}
