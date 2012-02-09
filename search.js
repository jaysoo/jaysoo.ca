$(function() {
    window.App = {};

    /*
     * Templates
     */
    var info = _.template('<p class="info hero-unit well">I found <%= count %> document<%= s %> matching your query</p>'),
        article = _.template('<article><h3><a href="<%= url %>"><%= title %></a></h3></article>'), 
        blurb = _.template('<p class="blurb"><%= text%></p>'),
        posted = _.template('<p class="pubdate"><time class="label" datetime="<%= date %>"><%= text %></time></p>');

    /*
     * Models, Views, Router
     */
    App.Document = Backbone.Model.extend({
        initialize: function(options) {
        }
    });

    App.Documents = Backbone.Collection.extend({
        model: App.Document ,

        page: function,

        fetch: function(options) {
            page = page || 1;

            if (!query) {
                $begin.show();
                return;
            }

            $begin.hide();

            from = (page - 1) * this._size;

            var that = this;

            $.when(
                $.ajax({
                    url: SEARCH_URL,
                    data: { q: query, size: this._size, from: from },
                    type: 'GET'
                })
            ).then(function(data) {
                var total = data.hits.total,
                    documents = $.map(data.hits.hits, function(hit) {
                        var doc = $.extend({}, hit._source);
                        if ( hit.highlight ) {
                            doc.highlight = hit.highlight.text;
                        }
                        return doc;
                    });

                $(info({ 
                    count: total > 0 ? total : 'no', 
                    s: total == 1 ? '' : 's' })
                ).appendTo($searchResults);

                _.each(documents, function(doc) {
                    var $item = $( article(doc) ).appendTo($searchResults),
                        highlight = doc.highlight ? doc.highlight.join('... ') : doc.text.substr(0, 200) + '...';

                    $( blurb({ text: highlight }) ).appendTo($item);

                    if ('date' in doc) {
                        $( posted({ 
                            date: doc.date,
                            text: Date.parse(doc.date.substr(0, doc.date.length - 1)).toString('dddd MMMM d, yyyy')
                        }) ).appendTo($item);
                    }
                });

                // Display more button if necessary
                if (total > page * this._size) {
                    $more.show();
                }
            });
        }
    });

    App.DocumentView = Backbone.View.extend({

        initialize: function(options) {
        },

        render: function() {
            var doc = this.model.toJSON(),

                $item = $( article(doc) ).appendTo($searchResults),

                highlight = doc.highlight ? doc.highlight.join('... ') : doc.text.substr(0, 200) + '...';

            $( blurb({ text: highlight }) ).appendTo($item);

            if ('date' in doc) {
                $( posted({ 
                    date: doc.date,
                    text: Date.parse(doc.date.substr(0, doc.date.length - 1)).toString('dddd MMMM d, yyyy')
                }) ).appendTo($item);
            }

            return $item;
        }
    });

    var documents = new App.Documents();

    App.ResultsView = Backbone.View.extend({
        initialize: function() {
            documents.bind('add',     this.addOne, this);
            documents.bind('reset', this.addAll, this);
            documents.bind('all',     this.render, this);

            documents.fetch();
        },

        render: function() {
        },

        addOne: function(doc) {
            var view = new DocumentView({ model: doc });
            this.$el.append(view.el);
        },

        addAll: function() {
                this
        }
    });

    App.Router = Backbone.Router.extend({
        routes: {
            '/search.html*query': 'search'
        },

        _size: 10,

        search: function(query) {
            $searchResults.empty();

            if ((/\?q=/).test(query)) {
                query = query.split('?q=')[1];
            } else {
                query = ''
            }

            this._doSearch(query);

        },

        _doSearch: function(query, page) {
            page = page || 1;

            if (!query) {
                $begin.show();
                return;
            }

            $begin.hide();

            from = (page - 1) * this._size;

            var that = this;

            $.when(
                $.ajax({
                    url: SEARCH_URL,
                    data: { q: query, size: this._size, from: from },
                    type: 'GET'
                })
                ).then(function(data) {

                    var total = data.hits.total,
                        documents = $.map(data.hits.hits, function(hit) {
                            var doc = $.extend({}, hit._source);
                            if ( hit.highlight ) {
                                doc.highlight = hit.highlight.text;
                            }
                            return doc;
                        });

                    $(info({ 
                        count: total > 0 ? total : 'no', 
                        s: total == 1 ? '' : 's' })
                    ).appendTo($searchResults);

                    _.each(documents, function(doc) {
                        var $item = $( article(doc) ).appendTo($searchResults),
                            highlight = doc.highlight ? doc.highlight.join('... ') : doc.text.substr(0, 200) + '...';

                        $( blurb({ text: highlight }) ).appendTo($item);

                        if ('date' in doc) {
                            $( posted({ 
                                date: doc.date,
                                text: Date.parse(doc.date.substr(0, doc.date.length - 1)).toString('dddd MMMM d, yyyy')
                            }) ).appendTo($item);
                        }
                    });

                    // Display more button if necessary
                    if (total > page * this._size) {
                        $more.show();
                    }
                });
            }
    });

    var SEARCH_URL = '/search/',

        facetReq = null,

        $searchBox = $('#search'),

        $more = $('#more'),

        $begin = $('#begin'),

        $searchResults = $('#results'),

        initialQuery = location.search,

        page = 1;

    App.router = new App.Router();

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
            search: function(query) {
                App.router.setLocation('/search.html?q=' + query);
            },

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

    $searchBox.find('input').focus();

    Backbone.history.start({ pushState: true });

    initialQuery && App.router.search(location.search);

    function ensureFacetReq() {
        if (!facetReq) {
            facetReq = $.ajax({
                url: SEARCH_URL,
                type: 'GET',
                data: { facet: true }
            });
        }
    }
    
});


