class Listing < ActiveRecord::Base
  belongs_to :user
  has_many :listingphoto
  
  validates_presence_of :user_id, :title, :description
  
  define_index do
    indexes title
    indexes description
    indexes location
    indexes otherinfo
    indexes city
    indexes statecode
    indexes zip
    has price
  end  
  
  def self.find_by_userid(userid) 
    find(:all, :conditions => ["user_id = ?", userid]) 
  end
  
  
end
  