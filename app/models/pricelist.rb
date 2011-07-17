class Pricelist < ActiveRecord::Base
  
  def self.find_all_ascending() 
    find(:all, :order => "pricevalue ASC") 
  end
  def self.find_all_descending() 
    find(:all, :order => "pricevalue DESC") 
  end
  
  def pricevalue_str
    pricevalue.to_s
  end
end
