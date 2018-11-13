chrome.runtime.sendMessage({type: 'showPageAction'});

const observerOptions = {
  childList: true,
  subtree: true
};

const jawBoneContentObserver = new MutationObserver(function(mutations, observer) {
  let node = mutations.find(function(mutation) { return mutation.target.hasAttribute('observed'); });
  if (node) {
    node = node.target;
    const headerNode = node.querySelector('.jawBone > h3');
    if (headerNode) {
      const titleNode = headerNode.querySelector('.title');
      const title = titleNode.querySelector('img') ? titleNode.querySelector('img').alt : titleNode.textContent;
      if (title) {
        getRatings(title, null, null, extractYear(node), function(ratings) {
          injectRatings(node.querySelector('.meta'), ratings);
        });
      }
    }
  }
});

const titleCardObserver = new MutationObserver(function(mutations, observer) {
  let node = mutations.find(function(mutation) {
    return mutation.target.hasAttribute('observed'); 
  });
  let title;
  
  if (node) {
    node = node.target;
    const titleNode = node.querySelector('.bob-title');
    if (titleNode) {
      title = title = titleNode.textContent;
    }
    if (titleNode && title) {
      getRatings(title, null, null, extractYear(node), function(ratings) {
        injectRatings(node.querySelector('.meta') || titleNode, ratings);
      });
    }
  }
});

function addTitleObserver(node) {
  node.querySelectorAll('.jawBoneContent').forEach(function(node) {
    if (!node.hasAttribute('observed')) {
      node.setAttribute('observed', 'true');
      jawBoneContentObserver.observe(node, observerOptions);
    }
  });
  node.querySelectorAll('.title-card-container > div > span').forEach(function(node) {
    if (!node.hasAttribute('observed')) {
      node.setAttribute('observed', 'true');
      titleCardObserver.observe(node, observerOptions);
    }
  });
  node.querySelectorAll('.bob-container-tall-panel > span').forEach(function(node) {
    if (!node.hasAttribute('observed')) {
      node.setAttribute('observed', 'true');
      titleCardObserver.observe(node, observerOptions);
    }
  });
}

const rowObserver = new MutationObserver(function(mutations, observer) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          addTitleObserver(node);
        }
      });
    }
  });
});

const mainObserver = new MutationObserver(function(mutations, observer) {
  const mainView = document.querySelector('.mainView');
  if (mainView) {
    observer.disconnect();
    rowObserver.observe(mainView, observerOptions);
    addTitleObserver(mainView);
    addFeaturedRatings(mainView);
  }
});

function addFeaturedRatings(node) {
  const jawBoneNode = node.querySelector('.jawBoneContainer > .jawBone');
  let title;
  
  if (jawBoneNode) {
    const titleNode = jawBoneNode.querySelector('.title');
    if (titleNode) {
      const img = titleNode.querySelector('img');
      if (img) {
        title = img.alt;
      } else {
        title = titleNode.textContent;
      }
      getRatings(title, null, null, extractYear(jawBoneNode), function(ratings) {
        injectRatings(node.querySelector('.meta'), ratings);
      });
    }
  }
}

const playerObserver = new MutationObserver(function(mutations, observer) {
  const titleContainerNode = document.querySelector('.video-title');
  if (titleContainerNode) {
    observer.disconnect();
    addPlayerRatings(titleContainerNode);
  }
});

function addPlayerRatings(titleContainerNode) {
  const titleNode = titleContainerNode.getElementsByTagName('h4')[0];
  let episodeInfo = {};
  Array.prototype.some.call(titleContainerNode.getElementsByTagName('span'), function(span) {
    if (span.classList.length === 0) {
      episodeInfo = extractEpisodeInfo(span.textContent);
      return true;
    }
  });
  getRatings(titleNode.textContent, episodeInfo['season'], episodeInfo['episode'], null, function(ratings) {
    injectRatings(titleNode.parentNode, ratings);
  });
}

const episodeContainerObserver = new MutationObserver(function(mutations, observer) {
  const episodeListContainer = document.querySelector('.episodes-pane');
  if (episodeListContainer) {
    addEpisodeRatings(episodeListContainer);
  }
});

function addEpisodeRatings(episodeListContainer) {
  const title = document.querySelector('.video-title').getElementsByTagName('h4')[0].textContent;
  const seasonNode = episodeListContainer.querySelector('.header-title');
  const season = extractSeasonNumber(seasonNode.textContent);
  if (season) {
    const episodes = episodeListContainer.querySelectorAll('.episode-row > div > span.number');
    episodes.forEach(function(episode) {
      if (title) {
        getRatings(title, season, episode.textContent, null, function(ratings) {
          injectRatings(episode.parentNode, ratings);
        });
      }
    });
  }
}
const mainView = document.querySelector('.mainView');
const titleContainerNode  = document.querySelector('.video-title');

if (mainView) {
  rowObserver.observe(mainView, observerOptions);
  addTitleObserver(mainView);
  addFeaturedRatings(mainView);
} else if (titleContainerNode) {
  addPlayerRatings(titleContainerNode);
} else {
  mainObserver.observe(document, observerOptions);
  playerObserver.observe(document, observerOptions);
  episodeContainerObserver.observe(document, observerOptions);
}
