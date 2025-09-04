"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const db_1 = require("./db");
const slug_1 = require("./slug");
const config_1 = __importDefault(require("../config"));
const promises_1 = __importDefault(require("fs/promises"));
// Initialize directories
const initDirectories = async () => {
    try {
        await promises_1.default.mkdir(config_1.default.storage.tracksDir, { recursive: true });
        await promises_1.default.mkdir(config_1.default.storage.uploadsDir, { recursive: true });
        // Ensure genres file exists
        try {
            await promises_1.default.access(config_1.default.storage.genresFile);
        }
        catch {
            // Default genres
            const defaultGenres = [
                'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic',
                'R&B', 'Country', 'Folk', 'Reggae', 'Metal', 'Blues', 'Indie'
            ];
            await promises_1.default.writeFile(config_1.default.storage.genresFile, JSON.stringify(defaultGenres, null, 2));
        }
    }
    catch (error) {
        console.error('Failed to initialize directories:', error);
        throw error;
    }
};
// Sample data for music tracks
const artists = [
    'Taylor Swift', 'Ed Sheeran', 'Adele', 'Drake', 'Kendrick Lamar',
    'Beyoncé', 'Coldplay', 'Billie Eilish', 'The Weeknd', 'Dua Lipa',
    'Bruno Mars', 'Ariana Grande', 'Justin Bieber', 'Post Malone', 'Rihanna',
    'Lady Gaga', 'BTS', 'Harry Styles', 'Bad Bunny', 'SZA'
];
const albums = [
    'Midnight', 'Divide', '30', 'Certified Lover Boy', 'DAMN.',
    'Renaissance', 'Music of the Spheres', 'Happier Than Ever', 'Dawn FM', 'Future Nostalgia',
    '24K Magic', 'Positions', 'Justice', 'Beerbongs & Bentleys', 'Anti',
    'Chromatica', 'Proof', 'Harry\'s House', 'Un Verano Sin Ti', 'SOS'
];
const trackTitles = [
    'Love Story', 'Shape of You', 'Hello', 'God\'s Plan', 'HUMBLE.',
    'BREAK MY SOUL', 'Yellow', 'bad guy', 'Blinding Lights', 'Levitating',
    'Uptown Funk', 'thank u, next', 'Peaches', 'Circles', 'Diamonds',
    'Rain On Me', 'Dynamite', 'As It Was', 'Tití Me Preguntó', 'Kill Bill',
    'Rocket Man', 'Bohemian Rhapsody', 'Thriller', 'Smells Like Teen Spirit', 'Sweet Child O\' Mine',
    'Imagine', 'Purple Haze', 'Stairway to Heaven', 'Like a Rolling Stone', 'Respect',
    'Hey Jude', 'What\'s Going On', 'Good Vibrations', 'Yesterday', 'Superstition',
    'London Calling', 'Purple Rain', 'God Only Knows', 'A Change Is Gonna Come', 'Heroes',
    'Born to Run', 'Billie Jean', 'I Want to Hold Your Hand', 'Gimme Shelter', 'Waterloo Sunset',
    'Johnny B. Goode', 'No Woman, No Cry', 'What\'d I Say', 'Papa\'s Got a Brand New Bag', 'Blowin\' in the Wind'
];
// Helper to get random element from array
const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};
// Helper to get random elements from array
const getRandomElements = (array, min, max) => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
// Generate a single random track
const generateRandomTrack = async (genres) => {
    const title = getRandomElement(trackTitles);
    const artist = getRandomElement(artists);
    const includeAlbum = Math.random() > 0.3; // 70% chance to have an album
    const track = {
        title,
        artist,
        album: includeAlbum ? getRandomElement(albums) : undefined,
        genres: getRandomElements(genres, 1, 3),
        slug: (0, slug_1.createSlug)(title),
        coverImage: `https://picsum.photos/seed/${encodeURIComponent(title)}/300/300`
    };
    return track;
};
// Generate and save multiple tracks
const seedDatabase = async (count = 50) => {
    try {
        console.log(`Initializing directories...`);
        await initDirectories();
        console.log(`Reading genres...`);
        const genresData = await promises_1.default.readFile(config_1.default.storage.genresFile, 'utf-8');
        const genres = JSON.parse(genresData);
        console.log(`Generating ${count} random tracks...`);
        for (let i = 0; i < count; i++) {
            const trackData = await generateRandomTrack(genres);
            await (0, db_1.createTrack)(trackData);
            process.stdout.write(`.`); // Show progress
        }
        console.log(`\nSuccessfully added ${count} tracks to the database.`);
    }
    catch (error) {
        console.error('Failed to seed database:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
// If this script is run directly
if (require.main === module) {
    const count = process.argv[2] ? parseInt(process.argv[2], 10) : 50;
    (0, exports.seedDatabase)(count)
        .then(() => {
        console.log('Database seeding completed successfully.');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Error seeding database:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-data.js.map