class UsersController < ApplicationController
  # Be sure to include AuthenticationSystem in Application Controller instead
  include AuthenticatedSystem
  
  before_filter :login_required, :except => [:new, :create, :forgotpassword, :sendpassword ]
  before_filter :user_is_admin, :except => [:new, :create, :edit, :update ]

  def forgotpassword
    
    respond_to do |format|
      format.html # index.html.erb
    end
  end

  def sendpassword
    
    email = params[:email]
    
    @user = User.find_by_email(email)

    
    newpassword = "987654321"

    if @user != nil
      begin
        @user.update_attributes!({:password => newpassword, :password_confirmation => newpassword})    
      rescue => e
        logger.info "Excepton Updating Password: #{e}"
      end
      Notifier.deliver_newpassword("shawn@shawnbradfordteam.com", email, newpassword)
    end
    
    respond_to do |format|
      format.html # index.html.erb
    end
  end

  def index
    @users = User.all

    respond_to do |format|
      format.html # index.html.erb
    end
  end

  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.html # index.html.erb
    end
  end

  # render new.rhtml
  def new
    @user = User.new
  end
 
  def create
    logout_keeping_session!
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
            # Protects against session fixation attacks, causes request forgery
      # protection if visitor resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset session
      self.current_user = @user # !! now logged in
      redirect_back_or_default('/')
      flash[:notice] = "Thanks for signing up!  We're sending you an email with your activation code."
    else
      flash[:error]  = "We couldn't set up that account, sorry.  Please try again, or contact an admin (link is above)."
      render :action => 'new'
    end
  end
  
  
  def edit
    @user = User.find(params[:id])
    @usstates = Usstate.find(:all)
  end
  
  def update
    flash[:notice] = ""
    @user = User.find(params[:id])
    logger.info "USER: #{params[:user]}"
    @usstates = Usstate.find(:all)

    respond_to do |format|
      if @user.update_attributes(params[:user])
        flash[:notice] = 'User was successfully updated.'
        format.html { redirect_to(@user) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to(user_url) }
      format.xml  { head :ok }
    end
  end
  
end
