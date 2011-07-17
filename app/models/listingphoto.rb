class Listingphoto < ActiveRecord::Base
  belongs_to :listing

  has_attached_file :photo, :path => ":rails_root/public/system/:class/:id/:style.:extension",
                    :url => "/system/:class/:id/:style.:extension",
                    :default_url => "/images/missing.gif",
                    :styles => { :large => "500x500>",
                                 :medium => "300x300>",
                                 :thumb => "140x140>",
                                 :tiny => "40x40"
                     }
  
  validates_presence_of :listing_id, :description
  validates_attachment_presence :photo, :message => ", Must Upload A Valid Image File"
  
end
