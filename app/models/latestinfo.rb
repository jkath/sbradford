class Latestinfo < ActiveRecord::Base
  
  def self.find_all_active() 
    find(:all, :conditions => ["is_active = ?", true]) 
  end
  
end
