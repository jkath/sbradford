class Article < ActiveRecord::Base
  
  validates_presence_of :title, :description
  
end
