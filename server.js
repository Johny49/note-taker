const express = require('express');
const { v4: uuidv4 } = require('uuid'); // for creating unique id for each note - uuidv4(); 
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

const readNotes = () => {
    // read and parse notes from file or create new empty array
    const notesData = JSON.parse(fs.readFileSync('./db/db.json', 'utf-8')) || [];
    return notesData;
};

const writeNotes = (noteData) => {
    // Convert note data to string
    const noteString = JSON.stringify(noteData, null, 2);

    // Write the string to db.json
    fs.writeFile('./db/db.json', noteString, (err) => {
        err
            ? console.error(err)
            : console.log(`New note has been saved`)
    });
};

// middleware for parsing json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Request for notes
app.get('/api/notes', (req, res) => {
    // Send notes to the client
    res.json(readNotes());

    // Log request to terminal
    console.info(`${req.method} request received to get notes`);
});

// POST Request to add a note 
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

        // retrieve note data and add new note
        const noteData = readNotes();
        noteData.push(newNote);

        // call function to write note data to db.json
        writeNotes(noteData);

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

// DELETE Request to remove a note based on id received
app.delete(`/api/notes/:id`, (req, res) => {
    const { id } = req.params;
    res.send(`Note ${id} deleted`);

    // Log request to terminal
    console.info(`${req.method} request received to delete note ${id}`);

    // retrieve saved notes and filter to remove the note with the received id
    const notes = readNotes().filter(note => note.id !== id);

    // Save updated notes
    writeNotes(notes);
});

// GET Route for notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// GET Route for homepage -- listed last to prevent capture of other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.listen(PORT, () => console.log(`Note Taker App listening at https:localhost:${PORT}`));