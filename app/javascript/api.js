/* exported fetchRatings */

const RT_URL = 'https://www.rottentomatoes.com/api/private/v2.0/search/';
const TIMEOUT = 3000;

const fetchedCache = {};
const fetchingCache = {};

function fetchRatings(title, season, episode, year, callback) {
  const argsString = Array.from(arguments)
    .slice(0, 4)
    .join(', ');
  const cacheKey = hashKey(title, season, episode, year);
  if (fetchedCache[cacheKey]) {
    log('Cached ratings for ' + argsString);
    callback(fetchedCache[cacheKey]);
  } else if (!fetchingCache[cacheKey]) {
    log('Fetching RT ratings for ' + argsString);
    fetchingCache[cacheKey] = true;

    $.ajax({
      url: RT_URL,
      type: 'GET',
      dataType: 'json',
      data: {
        limit: 5,
        q: title
      },
      success: function(response) {
        log(
          'Fetched RT ratings for ' +
            argsString +
            ': ' +
            JSON.stringify(response)
        );
        const ratings = fetchRTApiInfo(response, season, episode, year);
        fetchedCache[cacheKey] = ratings;
        callback(ratings);
      },
      error: function(jqXHR, status, errorThrown) {
        log(
          'Error status' +
            status +
            '. Failed to fetch RT ratings for ' +
            argsString +
            '.'
        );
        delete fetchingCache[cacheKey];
        fetchRatings(title, season, episode, null, callback);
        // callback(ratings);
      },
      timeout: TIMEOUT
    });
  }
}

function fetchRTApiInfo(res, year) {
  const ratings = {};
  let item;
  if (res.tvSeries.length > 0) {
    item = res.movies.find(movie => movie.year === year);
    if (!item) item = res.movies[0];
  } else {
    item = res.tvSeries.find(show => show.startYear === year);
    if (!item) item = res.tvSeries[0];
  }
  if (item && item.url) ratings.url = item.url;
  if (item && item.meterScore) ratings.rating = item.meterScore + '%';
  return ratings;
}

function hashKey(title, season, episode, year) {
  return (
    'Title:' +
    title +
    '&Season:' +
    season +
    '&Episode:' +
    episode +
    '&Year:' +
    year
  );
}
