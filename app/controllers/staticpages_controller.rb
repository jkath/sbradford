class StaticpagesController < ApplicationController
  
  def pubdocuments
    @documents = Document.find(:all)
  end

  def pubtestimonials
    @testimonials = Testimonial.find(:all)
  end
  
  
  def publistinglist
    @listings = Listing.find(:all)
  end

end
