const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid'); // for creating unique id for each note - uuidv4(); 

const PORT = process.env.PORT || 3001;

const app = express();

const readNotes = () => {
    // read and parse notes from file or create new empty array
    const notesData = JSON.parse(fs.readFileSync('./db/db.json', 'utf-8')) || [];
    return notesData;
};

// middleware for parsing json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

// GET Route for notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// GET Request for notes
app.get('/api/notes', (req, res) => {
    // Send message to the client
    res.json(`${req.method} request received to get notes`);

    // Log request to terminal
    console.info(`${req.method} request received to get notes`);
});

// POST Request to add a review 
app.post('/api/notes', (req, res) => {
    // Log that POST was received
    console.info(`${req.method} request was received to add a note`);

    //Destructuring assignment for items in req.body
    const { title, text } = req.body;

    // Verify required properties are present, then create object for the note to be saved
    if (title && text) {
        const newNote = {
            id: uuidv4(),
            title,
            text,
        };

        const noteData = readNotes();
        noteData.push(newNote);

        // Convert note data to string
        const noteString = JSON.stringify(noteData, null, 2);

        // Write the string to db.json
        fs.writeFile('./db/db.json', noteString, (err) => {
            err
                ? console.error(err)
                : console.log(`Note with title ${newNote.title} has been written`)
        });

        const response = {
            status: 'Success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in saving note');
    }
});

app.listen(PORT, () => console.log(`Note Taker App listening at https:localhost:${PORT}`));