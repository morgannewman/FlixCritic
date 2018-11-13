/* exported fetchRatings */

const RT_URL = 'https://www.rottentomatoes.com/api/private/v2.0/search/';
const OMDB_URL = 'https://private.omdbapi.com/?';
const OMDB_API_KEY = '1e0ce2f6';
const TIMEOUT = 3000;

const fetchedCache = {};
const fetchingCache = {};

function fetchRatings(title, season, episode, year, callback) {
  const argsString = Array.from(arguments).slice(0, 4).join(', ');
  const cacheKey = hashKey(title, season, episode, year);
  if (fetchedCache[cacheKey]) {
    log('Cached ratings for ' + argsString);
    callback(fetchedCache[cacheKey]);
  } else if (!fetchingCache[cacheKey]) {
    log('Fetching OMDB ratings for ' + argsString);
    fetchingCache[cacheKey] = true;
    $.ajax({
      url: OMDB_URL,
      dataType: 'json',
      data: requestOptions(title, season, episode, year),
      success: function(response) {
        if (!response.imdbRating && year) {
          log('Failed to fetch OMDB ratings for ' + argsString);
          delete fetchingCache[cacheKey];
          return fetchRatings(title, season, episode, null, callback);
        }
        const ratings = {
          imdb: response.imdbRating,
          imdbID: response.imdbID,
          rt: filterRTRating(response),
          metacritic: response.Metascore
        };
        log('Fetched OMDB ratings for ' + argsString + ': ' + JSON.stringify(ratings));
        log('Fetching RT ratings for ' + argsString);
        callback(ratings);
        $.ajax({
          url: RT_URL,
          type: 'GET',
          dataType: 'json',
          data: {
            limit: 5,
            q: response.Title
          },
          success: function(RTResponse) {
            const rtInfo = fetchRTApiInfo(RTResponse, response);
            log('Fetched RT ratings for ' + argsString + ': ' + JSON.stringify(rtInfo));
            if (rtInfo.rating) ratings.rt = rtInfo.rating;
            if (rtInfo.url) ratings.rtUrl = rtInfo.url;
            fetchedCache[cacheKey] = ratings;
            callback(ratings);
          },
          error: function(jqXHR, status, errorThrown) {
            log('Error status' + status + '. Failed to fetch RT ratings for ' + argsString + '.');
            fetchedCache[cacheKey] = ratings;
            callback(ratings);
          },
          timeout: TIMEOUT
        });
      },
      error: function(jqXHR, status, errorThrown) {
        if (status === 'timeout') {
          log('Failed to fetch ratings for ' + argsString + ' due to timeout');
          delete fetchingCache[cacheKey];
          fetchRatings(title, season, episode, null, callback);
        }
      },
      timeout: TIMEOUT
    });
  }
}

function fetchRTApiInfo(RTResponse, IMDBResponse) {
  const type = IMDBResponse.Type;
  const year = IMDBResponse.Year ? IMDBResponse.Year.slice(0,4) : 0;
  const rtInfo = {};
  let item;
  switch(type) {
    case 'movie':
      item = RTResponse.movies.find(function(movie) { 
        return movie.year === year;
      });
      if (!item) item = RTResponse.movies[0];
      break;
    case 'episode':
    case 'series':
      item = RTResponse.tvSeries.find(function(show) {
        return show.startYear === year;
      });
      if (!item) item = RTResponse.tvSeries[0];
      break;
  }
  if (item && item.url)	rtInfo.url = item.url;
  if (item && item.meterScore) rtInfo.rating = item.meterScore + '%';
  return rtInfo;
}

function filterRTRating(response) {
  const ratingsArray = response['Ratings'];
  if (ratingsArray) {
    const rtRating = ratingsArray.find(rtFilter);
    if (rtRating) {
      return rtRating['Value'];
    }
  }
}

function rtFilter(rating) {
  return rating['Source'] === 'Rotten Tomatoes';
}

function requestOptions(title, season, episode, year) {
  const options = {
    'apikey': OMDB_API_KEY
  };
  if (title) {
    options['t'] = title.replace(/’/g, "'");
  }
  if (season) {
    options['Season'] = season;
  }
  if (episode) {
    options['Episode'] = episode;
  }
  if (year) {
    options['y'] = year;
  }
  return options;
}

function hashKey(title, season, episode, year) {
  return 'Title:' + title + '&Season:' + season + '&Episode:' + episode + '&Year:' + year;
}

Array.prototype.find = Array.prototype.find || function(callback) {
  if (this === null) {
    throw new TypeError('Array.prototype.find called on null or undefined');
  } else if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function');
  }
  const list = Object(this);
  const length = list.length >>> 0;
  const thisArg = arguments[1];
  for (let i = 0; i < length; i++) {
    const element = list[i];
    if ( callback.call(thisArg, element, i, list) ) {
      return element;
    }
  }
};
