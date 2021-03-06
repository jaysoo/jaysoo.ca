'use strict';

$(function() {
  var SEARCH_URL = '/search/',

    initialQuery = location.search,

    // Will lazily populate this when needed
    facetReq = null,

    $searchBox = $('#search'),

    $begin = $('#begin'),

    $searchResults = $('#results'),

    info = _.template('<p class="info hero-unit well">I found <%= count %> document<%= s %> matching your query</p>'),

    article = _.template(['<article>',
      '<h3><a href="<%= url %>"><%= title %></a></h3>',
      '</article>'].join('')),

    blurb = _.template('<p class="blurb"><%= text%></p>'),

    posted = _.template('<p class="pubdate"><time class="label" datetime="<%= date %>"><%= text %></time></p>');

  if ((/\?q=/).test(initialQuery)) {
    initialQuery = initialQuery.split('?q=')[1];
  } else {
    initialQuery = ''
  }

  // Setup visual search
  var visualSearch = VS.init({
    container: $searchBox,
    query: initialQuery,
    callbacks: {
      search: doSearch,

      facetMatches: function(callback) {
        // Only do this once :)
      ensureFacetReq();

         facetReq.success(function(data) {
            var facets = [];

            for (var k in data.facets) {
              if (data.facets.hasOwnProperty(k)) {
                facets.push(k);
              }
            }

            callback(facets, { preserveOrder: true });
          })
      },

      valueMatches: function(facet, searchTerm, callback) {
        ensureFacetReq();

        facetReq.success(function(data) {
          if (!(facet in data.facets))
            return;

          var obj = data.facets[facet];

          switch (obj._type) {
          case 'terms':
            callback(_.pluck( obj.terms, 'term' ), { preserveOrder: true });
            break;
          case 'date_histogram':
            callback(_.pluck( obj.entries, 'time' ), { preserveOrder: true });
            break;
          }
        });
      }
    }
  });

  function ensureFacetReq() {
    if (!facetReq) {
      facetReq = $.ajax({
        url: SEARCH_URL,
        type: 'GET',
        data: { facet: true }
      });
    }
  }

  function doSearch(query) {
    $searchResults.empty();

    if (!query) {
      $begin.show();
      return;
    }

    $begin.hide();

    $.when(
      $.ajax({
        url: SEARCH_URL,
        data: { q: query },
        type: 'GET'
      })
      ).then(function(data) {

        var total = data.hits.total,
          documents = $.map(data.hits.hits, function(hit) {
            return $.extend({}, hit._source, { highlight: hit.highlight.text });
          });

        $(info({ 
          count: total > 0 ? total : 'no', 
          s: total == 1 ? '' : 's' })
        ).appendTo($searchResults);

        _.each(documents, function(doc) {
          var $item = $( article(doc) ).appendTo($searchResults),
            highlights = doc.highlight.join('... ');

          $( blurb({ text: highlights }) ).appendTo($item);

          if ('date' in doc) {
            $( posted({ 
              date: doc.date,
              text: Date.parse(doc.date.substr(0, doc.date.length - 1)).toString('dddd MMMM d, yyyy')
            }) ).appendTo($item);
          }
        });
      });
  }

  initialQuery && doSearch(initialQuery);

  $searchBox.find('input').focus();

});
