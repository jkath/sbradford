class Sitetext < ActiveRecord::Base
  
  def self.find_by_textkey(key)
    find(:first, :conditions => ["textkey = ?", key])
  end
  
end
