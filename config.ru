require 'sprockets'
require 'coffee-script'

use Rack::CommonLogger

Tilt::CoffeeScriptTemplate.default_bare = true

map '/js' do
  environment = Sprockets::Environment.new
  environment.append_path 'assets/javascripts'
  environment.append_path 'assets/javascripts/lib'
  run environment
end

map "/" do
  environment = Sprockets::Environment.new
  environment.append_path 'assets/media/images'
  environment.append_path 'assets/media/models'
  environment.append_path 'views'
  run environment
end
