const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');
const outputFile = path.join(__dirname, 'database.js');

// Delay utility
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAppleMusicData(query) {
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const track = data.results[0];
            return {
                album: track.collectionName || 'Unknown Album',
                cover: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : null
            };
        }
    } catch (err) {
        console.error('Error fetching data for query:', query, err.message);
    }
    return null;
}

async function main() {
    const files = fs.readdirSync(songsDir).filter(f => f.endsWith('.mp3'));
    console.log(`Found ${files.length} mp3 files. Starting fetch...`);
    
    const db = [];
    
    for (const [index, file] of files.entries()) {
        const titleRaw = file.replace(/\.mp3$/i, '');
        
        let cover = 'iuHeart-2x.gif';
        let album = 'IU Album'; // default
        
        // Strategy 1: Full raw title prepended with IU
        let result = await fetchAppleMusicData(`IU ${titleRaw}`);
        
        // Strategy 2: Remove anything in parentheses (features, korean names which sometimes confuse search if mixed weirdly, though korean usually helps)
        if (!result) {
            const cleanTitle = titleRaw.replace(/\([^)]+\)/g, '').trim();
            if (cleanTitle && cleanTitle !== titleRaw) {
                await delay(100);
                result = await fetchAppleMusicData(`IU ${cleanTitle}`);
            }
        }

        // Strategy 3: Only the korean part or specific words? Let's just fallback if strat 2 fails.
        // It's a best-effort script.
        
        if (result) {
            album = result.album;
            if (result.cover) cover = result.cover;
        } else {
            console.log(`[!] No metadata found for: ${titleRaw}`);
        }
        
        const titleForDisplay = titleRaw.replace(/\([^)]+\)/g, '').trim() || titleRaw; // Use clean title for display but let's just keep raw title so users see what they type.
        // Wait actually, let's keep the raw title (without .mp3) as the title to match how it was likely played, or just use the extracted title.
        // Usually, the raw title contains korean. 
        // In the user's screenshot, it said "Good Day", which is a clean title.
        // But some are literally just "BBIBBI (삐삐)" or "Good day (좋은 날)". 
        // Let's use the file name without extension as title, since it's what they had.
        
        db.push({
            title: titleRaw,
            file: `songs/${file}`,
            album: album,
            cover: cover
        });
        
        console.log(`[${index + 1}/${files.length}] Processed: ${titleRaw} -> ${album}`);
        await delay(150); // Be nice to iTunes API!
    }
    
    const fileContent = `const musicasIU = ${JSON.stringify(db, null, 4)};`;
    fs.writeFileSync(outputFile, fileContent, 'utf-8');
    
    console.log('\ndatabase.js has been generated successfully!');
}

main();
