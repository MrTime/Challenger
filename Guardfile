guard 'coffeescript', :bare => true, :input => "assets/javascripts", :output => 'assets/javascripts/compiled'
guard 'coffeescript', :bare => true, :input => "spec/coffeescripts", :output => 'spec/javascripts'

guard 'livereload' do
  watch(/^spec\/javascripts\/compiled\/.+\.js$/)
  watch(/^public\/javascripts\/compiled\/.+\.js$/)
end
