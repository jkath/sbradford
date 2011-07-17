class Document < ActiveRecord::Base
  
  has_attached_file :document, :path => ":rails_root/public/system/:class/:id/:basename.:extension",
                    :url => "/system/:class/:id/:basename.:extension"
                    
    validates_attachment_presence :document, :message => ", Must Upload A Valid Document File"
    validates_presence_of :title, :description
    
    def self.find_by_pageid(id)
      find(:all, :conditions => ["preferredpage = ?", id]) 
    end
    
end
