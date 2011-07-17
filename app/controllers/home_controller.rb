class HomeController < ApplicationController

  def index
    @usstates = Usstate.find(:all)
    @pricelistfrom = Pricelist.find_all_ascending()
    @pricelistto = Pricelist.find_all_descending()
  end
  
end
