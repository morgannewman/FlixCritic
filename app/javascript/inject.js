/* exported injectRatings */

function imdbSpan() {
  const span = document.createElement('SPAN');
  span.className = 'imdbRating';
  return span;
}

function rtSpan() {
  const span = document.createElement('SPAN');
  span.className = 'rtRating';
  return span;
}

function metacriticSpan() {
  const span = document.createElement('SPAN');
  span.className = 'metacriticRating';
  return span;
}

function imdbLinkNode(id) {
  const link = document.createElement('A');
  link.href = 'https://www.imdb.com/title/' + id;
  link.target = '_blank';
  return link;
}

function imdbLogoNode(id) {
  const span = imdbSpan();
  const link = imdbLinkNode(id);
  const image = document.createElement('IMG');
  image.src = chrome.extension.getURL('images/imdb_31x14.png');
  image.className = 'imdbLogo';
  link.appendChild(image);
  span.appendChild(link);
  return span;
}

function imdbRatingNode(id, rating) {
  rating.replace('N/A', '');
  const span = imdbSpan();
  const link = imdbLinkNode(id);
  const ratingNode = document.createTextNode(rating);
  link.appendChild(ratingNode);
  span.appendChild(link);
  return span;
}

function rtLinkNode(url) {
  const link = document.createElement('A');
  link.href = 'https://www.rottentomatoes.com' + url;
  link.target = '_blank';
  return link;
}

function rtLogoNode(url) {
  const span = rtSpan();
  const image = document.createElement('IMG');
  image.src = chrome.extension.getURL('images/rt_logo.png');
  image.className = 'rtLogo';
  if (url) {
    const link = rtLinkNode(url);
    link.appendChild(image);
    span.appendChild(link);
  }	else {
    span.appendChild(image);
  }
  return span;
}

function rtRatingNode(url, rating) {
  const span = rtSpan();
  const ratingNode = document.createTextNode(rating);
  if (url) {
    const link = rtLinkNode(url);
    link.appendChild(ratingNode);
    span.appendChild(link);
  }	else {
    span.appendChild(ratingNode);
  }
  return span;
}

function metacriticLogoNode() {
  const span = metacriticSpan();
  const image = document.createElement('IMG');
  image.src = chrome.extension.getURL('images/metacritic_logo.png');
  image.className = 'metacriticLogo';
  span.appendChild(image);
  return span;
}

function metacriticRatingNode(rating) {
  const span = metacriticSpan();
  rating = document.createTextNode(rating);
  
  span.appendChild(rating);
  return span;
}

function should_append_imdb(rating, id) {
  if ((rating && rating !== 'N/A') || id) {
    return true;
  }
  return false;
}

function injectRatings(node, ratings) {
  const imdbRating = ratings['imdb'];
  const imdbId = ratings['imdbID'];
  const rtRating = ratings['rt'];
  const rtUrl = ratings['rtUrl'];
  const metascore = ratings['metacritic'];
  if (node) {
    if (!node.querySelector('.imdbRating')) {
      if (should_append_imdb(imdbRating, imdbId)) {
        node.appendChild(imdbLogoNode(imdbId));
        node.appendChild(imdbRatingNode(imdbId, imdbRating));
      } else {
        node.appendChild(imdbSpan());
        node.appendChild(imdbSpan());
      }
    }
    if ((rtRating || rtUrl)) {
      if(!node.querySelector('.rtRating')) {
        node.appendChild(rtLogoNode(rtUrl));
        if (rtRating) {
          node.appendChild(rtRatingNode(rtUrl, rtRating));
        }
      } else if (!node.querySelector('.rtRating a')) {
        node.replaceChild(rtLogoNode(rtUrl), node.querySelectorAll('.rtRating')[0]);
        if (rtRating) {
          node.replaceChild(rtRatingNode(rtUrl, rtRating), node.querySelectorAll('.rtRating')[1]);
        }
      }
    }
    if (metascore && metascore !== 'N/A' && !node.querySelector('.metacriticRating')) {
      node.appendChild(metacriticLogoNode());
      node.appendChild(metacriticRatingNode(metascore));
    }
  }
}