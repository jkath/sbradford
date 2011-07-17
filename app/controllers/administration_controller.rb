class AdministrationController < ApplicationController
  before_filter :login_required
  before_filter :user_is_admin
  
  
  def adminmain
    
  end
  
end
