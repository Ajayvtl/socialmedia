const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const downloads = [
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Outdoors-man-portrait_%28cropped%29.jpg/600px-Outdoors-man-portrait_%28cropped%29.jpg', name: 'avatar1.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Woman_portrait_2010.jpg/600px-Woman_portrait_2010.jpg', name: 'match1.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/600px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg', name: 'travel1.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Party_crowd_at_a_concert.jpg/600px-Party_crowd_at_a_concert.jpg', name: 'party1.jpg' },
  { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/600px-Image_created_with_a_mobile_phone.png', name: 'post1.jpg' }
];

downloads.forEach(d => {
  https.get(d.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download ${d.name}: HTTP ${res.statusCode}`);
      return;
    }
    const file = fs.createWriteStream(path.join(dir, d.name));
    res.pipe(file);
    file.on('finish', () => console.log('Downloaded', d.name));
  }).on('error', (err) => {
    console.error(`Error downloading ${d.name}:`, err.message);
  });
});
