class PlunkerTag < Liquid::Tag
  def initialize(name, text, token)
    super
    @params = self.parse_params(text)
  end

  def render(context)
    if @params['src']
      "<iframe style='width: 100%; height: #{@params["height"]}; background-color: white; margin: 20px 0' sandbox='allow-same-origin allow-scripts' src='http://embed.plnkr.co/#{@params["src"]}/preview'></iframe>"
    else
      'missing src in plunker tag!'
    end
  end

  # expecting "key1:val key2:val"
  def parse_params(text)
    defaults = {
      height: '500px'
    }

    text.split(' ').each.with_object(defaults) do |token, params|
      key, value = token.split(':')
      params[key] = value
    end
  end
end

Liquid::Template.register_tag('plunker', PlunkerTag)