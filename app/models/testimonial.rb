class Testimonial < ActiveRecord::Base
  
    validates_presence_of :title, :testimonial
    
end
