# Author: Toby DiPasquale <toby@cbcg.net>
# Modified by: László Bácsi <lackac@lackac.hu>
require 'fileutils'
require 'rubygems'
require 'sequel'
require 'htmlentities'
require 'yaml'

class String
  def decode_entities
    coder = HTMLEntities.new
    coder.decode(self)
  end
end

module Jekyll
  module Typo
    # this SQL *should* work for both MySQL and PostgreSQL, but I haven't
    # tested PostgreSQL yet (as of 2008-12-16)
    SQL = <<-EOS
    SELECT c.id AS id,
           c.type AS type,
           c.title AS title,
           COALESCE(c.permalink, c.name) AS slug,
           c.body AS body,
           c.extended AS extended,
           c.keywords AS tags,
           c.published_at AS date,
           c.state AS state,
           COALESCE(tf.name, 'html') AS filter
      FROM contents c
           LEFT OUTER JOIN text_filters tf
                        ON c.text_filter_id = tf.id
    EOS

    def self.process dbname, user, pass, host='localhost'
      FileUtils.mkdir_p '_posts'
      db = Sequel.postgres dbname, :user => user, :password => pass, :host => host
      db[SQL].each do |post|
		if not post[:date]
			next
		end

        puts "#{post[:type]}: #{post[:title]}"

        name = post[:slug].strip.tr('/', '-')
        if post[:type] == "Article"
          name = "#{post[:date].strftime("%Y-%m-%d")}-#{name}"
          dir = '_posts'
          layout = 'post'
        else
          post[:filter] = "html"
          dir = '_import'
          layout = 'default'
        end

        # Can have more than one text filter in this field, but we just want
        # the first one for this
        name += '.' + post[:filter].split(' ')[0]

        File.open("#{dir}/#{name}", 'w') do |f|
          f.puts({ 'layout'   => layout,
                   'title'    => post[:title].to_s,
                   'created_at' => post[:date],
                   'tags'     => post[:tags],
                   'typo_id'  => post[:id]
                 }.delete_if { |k, v| v.nil? || v == '' }.to_yaml)
          f.puts '---'
          f.puts post[:body].delete("\r").decode_entities
          if post[:extended]
            f.puts post[:extended].delete("\r").decode_entities
          end
        end
      end
    end

  end   # module Typo
end   # module Jekyll

if __FILE__ == $PROGRAM_NAME
  unless ARGV.size < 3
    Jekyll::Typo.process(*ARGV)
  else
    puts "Usage: #{__FILE__} typo_db db_user db_pass [db_host]"
    exit 1
  end
end
