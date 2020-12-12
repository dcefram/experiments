const di = require('domain-info');

di.whois('eriehousing.com', (err, data) => {
  if (err) throw new Error(err.message);

  const whoisResult = data.split('\n').reduce((accum, line) => {
    const [rawKey, ...rawValue] = line.split(':');

    if (rawValue) {
      const key = rawKey.trim().replace(/\s/g, '_');
      const value = rawValue.join(':').trim();

      if (key && value) {
        if (accum[key]) {
          if (!Array.isArray(accum[key])) {
            accum[key] = [accum[key]];
          }

          accum[key].push(value);
        } else {
          accum[key] = value;
        }
      }
    }

    return accum;
  }, {});

  console.log(whoisResult);
});