class FriendsofusersController < ApplicationController
  before_filter :login_required
  before_filter :user_is_admin
  
  
  # GET /friendsofusers
  # GET /friendsofusers.xml
  def index
    @friendsofusers = Friendsofuser.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @friendsofusers }
    end
  end

  # GET /friendsofusers/1
  # GET /friendsofusers/1.xml
  def show
    @friendsofuser = Friendsofuser.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @friendsofuser }
    end
  end

  # GET /friendsofusers/new
  # GET /friendsofusers/new.xml
  def new
    @friendsofuser = Friendsofuser.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @friendsofuser }
    end
  end

  # GET /friendsofusers/1/edit
  def edit
    @friendsofuser = Friendsofuser.find(params[:id])
  end

  # POST /friendsofusers
  # POST /friendsofusers.xml
  def create
    @friendsofuser = Friendsofuser.new(params[:friendsofuser])

    respond_to do |format|
      if @friendsofuser.save
        flash[:notice] = 'Friendsofuser was successfully created.'
        format.html { redirect_to(@friendsofuser) }
        format.xml  { render :xml => @friendsofuser, :status => :created, :location => @friendsofuser }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @friendsofuser.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /friendsofusers/1
  # PUT /friendsofusers/1.xml
  def update
    @friendsofuser = Friendsofuser.find(params[:id])

    respond_to do |format|
      if @friendsofuser.update_attributes(params[:friendsofuser])
        flash[:notice] = 'Friendsofuser was successfully updated.'
        format.html { redirect_to(@friendsofuser) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @friendsofuser.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /friendsofusers/1
  # DELETE /friendsofusers/1.xml
  def destroy
    @friendsofuser = Friendsofuser.find(params[:id])
    @friendsofuser.destroy

    respond_to do |format|
      format.html { redirect_to(friendsofusers_url) }
      format.xml  { head :ok }
    end
  end
end
