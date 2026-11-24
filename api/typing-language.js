const russianRegion = new Set('AM AZ BY EE GE KZ KG LV LT MD RU TJ TM UA'.split(' '));

export default function handler(req, res) {
  const country = req.headers['x-vercel-ip-country'];
  let language = 'english';
  if (country === 'UZ') language = 'uzbek_latin';
  else if (russianRegion.has(country)) language = 'russian';
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country: country || 'unknown', language });
}
