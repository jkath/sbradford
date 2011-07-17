class Message < ActiveRecord::Base
  belongs_to :user
  
  def self.find_by_sender(userid)
    find(:all, :conditions => ["user_id = ?", userid]) 
  end

  def self.find_by_recipient(userid)
    find(:all, :conditions => ["recipient_id = ?", userid]) 
  end
  
end