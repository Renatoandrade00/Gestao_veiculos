const https = require('https');
https.get('https://vehicle-maintenance-frontend-mb92.onrender.com', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const match = data.match(/assets\/index-[^\.]+\.js/);
    if(match) {
      https.get('https://vehicle-maintenance-frontend-mb92.onrender.com/' + match[0], (res2) => {
        let data2 = '';
        res2.on('data', (c) => data2 += c);
        res2.on('end', () => {
          const urls = data2.match(/https:\/\/[a-zA-Z0-9-]+\.onrender\.com/g);
          console.log([...new Set(urls)]);
        });
      });
    } else console.log('no match');
  });
});
