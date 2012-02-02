require 'rubygems'
require 'rubberband'

# Adapted from https://raw.github.com/PascalW/jekyll_indextank/master/indexer.rb

module Jekyll

  class Indexer < Generator

    def generate(site)
      raise ArgumentError.new 'Missing elasticsearch_url.' unless site.config['elasticsearch_url']

	  base_url = site.config['production_url']

      client = ElasticSearch.new(site.config['elasticsearch_url'], :index => "jaysoo", :type => "page")

      puts 'Indexing posts...'

      site.posts.each do |post|
        text = post.content

		document = {
		  :body => text,
		  :url => base_url + post.url
		}

		if post.tags
		  document['tags'] = post.tags
		end

		client.index(document, :id => post.url)
      end

	  pages = site.pages

	  pages = pages.find_all {|p| p.output_ext == '.html' } 
	  pages.reject! {|p| p.data['noindex'] } 

	  puts 'Indexing pages...'

      pages.each do |page|
        text = page.content

		url = '/' + page.name

		client.index({
		  :body => text,
		  :url => base_url + url
		}, :id => url)
      end

      puts 'Indexing done!'
    end

  end 
end
