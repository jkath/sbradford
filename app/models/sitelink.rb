class Sitelink < ActiveRecord::Base
  
  has_attached_file :photo, :path => ":rails_root/public/system/:class/:id/:style.:extension",
                    :url => "/system/:class/:id/:style.:extension",
                    :default_url => "/images/missing.gif",
                    :styles => { :large => "500x500>",
                                 :medium => "300x300>",
                                 :thumb => "140x140>",
                                 :tiny => "40x40"
                     }
  
    validates_presence_of :title, :url
  
  def self.find_by_pageid(id)
    find(:all, :conditions => ["preferredpage = ?", id]) 
  end
  
end
