/* exported extractEpisodeInfo extractSeasonNumber extractYear*/

function extractSeasonNumber(seasonText) {
  const regex = /(S|s)eason (\d+)/;
  const match = regex.exec(seasonText);
  if (match) {
    return match[2];
  }
  return null;
}

function extractEpisodeInfo(episodeText) {
  const info = {};
  if (episodeText) {
    const regex = /\D*(\d+)\D*(\d+)/;
    const match = regex.exec(episodeText);
    info['season'] = match[1];
    info['episode'] = match[2];
  }
  return info;
}

function extractYear(containerNode) {
  // Try to guess first year of TV show (Netflix usually uses last season year)
  const durationNode = containerNode.querySelector('.duration');
  const yearNode = containerNode.querySelector('.year');
  let year = yearNode ? yearNode.textContent : null;

  if (durationNode) {
    const match = /(\d+) Seasons?/.exec(durationNode.textContent);
    if (match) {
      log('Year was ' + year);
      log('Match is ' + match[1]);
      year = year - (match[1] - 1);
      log('Guessing ' + year);
    }
  }

  return year;
}