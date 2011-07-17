class SitetextsController < ApplicationController

  before_filter :login_required
  before_filter :user_is_admin
  
  # GET /sitetexts
  # GET /sitetexts.xml
  def index
    @sitetexts = Sitetext.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @sitetexts }
    end
  end

  # GET /sitetexts/1
  # GET /sitetexts/1.xml
  def show
    @sitetext = Sitetext.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @sitetext }
    end
  end

  # GET /sitetexts/new
  # GET /sitetexts/new.xml
  def new
    @sitetext = Sitetext.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @sitetext }
    end
  end

  # GET /sitetexts/1/edit
  def edit
    @sitetext = Sitetext.find(params[:id])
  end

  # POST /sitetexts
  # POST /sitetexts.xml
  def create
    @sitetext = Sitetext.new(params[:sitetext])

    respond_to do |format|
      if @sitetext.save
        flash[:notice] = 'Sitetext was successfully created.'
        format.html { redirect_to :action => 'index' }
        format.xml  { render :xml => @sitetext, :status => :created, :location => @sitetext }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @sitetext.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /sitetexts/1
  # PUT /sitetexts/1.xml
  def update
    @sitetext = Sitetext.find(params[:id])

    respond_to do |format|
      if @sitetext.update_attributes(params[:sitetext])
        flash[:notice] = 'Sitetext was successfully updated.'
        format.html { redirect_to :action => 'index' }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @sitetext.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /sitetexts/1
  # DELETE /sitetexts/1.xml
  def destroy
    @sitetext = Sitetext.find(params[:id])
    @sitetext.destroy

    respond_to do |format|
      format.html { redirect_to(sitetexts_url) }
      format.xml  { head :ok }
    end
  end
end
