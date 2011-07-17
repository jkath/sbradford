class Searchcriteria
  attr_accessor :srchtoken, :city, :statecode, :zip, :pricefrom, :priceto
    
  def initialize(obj)
    if obj == nil    
      @srchtoken = ""
      @city = "Phoenix"
      @statecode = "AZ"
      @zip = ""
      @pricefrom = "100000"
      @priceto = "200000"
    else
      @srchtoken = obj[:srchtoken]
      @city = obj[:city]
      @statecode = obj[:statecode]
      @zip = obj[:zip]
      @pricefrom = obj[:pricefrom]
      @priceto = obj[:priceto]      
    end

  end
  
end
