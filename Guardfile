guard 'coffeescript', :bare => true, :output => 'assets/javascripts/compiled' do
  watch(/^assets\/javascripts\/(.*)\.coffee/)
end

guard 'coffeescript', :bare => true, :output => 'spec/javascripts/compiled' do
  watch(/^spec\/javascripts\/(.*)\.coffee/)
end

guard 'livereload' do
  watch(/^spec\/javascripts\/compiled\/.+\.js$/)
  watch(/^public\/javascripts\/compiled\/.+\.js$/)
end
