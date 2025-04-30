// api/currentsong.js
export default async function handler(req, res) {
    const response = await fetch('https://listen.ramashamedia.com/8330/currentsong?sid=1');
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(text);
  }
  