require 'rubygems'
require 'nokogiri'
require 'rubberband'

# Adapted from https://raw.github.com/PascalW/jekyll_indextank/master/indexer.rb

module Jekyll

  class Indexer < Generator

    def generate(site)
      raise ArgumentError.new 'Missing elasticsearch_url.' unless site.config['elasticsearch_url']

	  return unless site.config['doindex']

	  base_url = site.config['production_url']

      client = ElasticSearch.new(site.config['elasticsearch_url'], :index => "jaysoo", :type => "page")

      puts 'Indexing posts...'

      site.posts.each do |post|
        text = extract_text(site, post)
		date_str = post.data['created_at'] || post.date.strftime('%Y-%m-%d %H:%MZ')

		document = {
		  :title => post.data['title'],
		  :text => text,
		  :date => date_str,
		  :url => base_url + post.url
		}

		if post.tags
		  document['tags'] = post.tags
		end

		if post.data.has_key?('category')
		  document['category'] = post.data['category']
		end

		client.index(document, :id => post.url)
      end

	  pages = site.pages

	  pages = pages.find_all {|p| p.output_ext == '.html' } 
	  pages.reject! {|p| p.data['noindex'] } 

	  puts 'Indexing pages...'

      pages.each do |page|
        text = extract_text(site, page)

		url = page.url()

		client.index({
		  :title => page.data['title'],
		  :text => text,
		  :url => base_url + url
		}, :id => url)
      end

      puts 'Indexing done!'
    end

    def extract_text(site, page)
  	  page.render(site.layouts, site.site_payload)
  	  doc = Nokogiri::HTML(page.output)
	  main = doc.css("#main")
  	  page_text = main.text.gsub("\r"," ").gsub("\n"," ").gsub(/\s+/, " ")
    end

  end 
end
