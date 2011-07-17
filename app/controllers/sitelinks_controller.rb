class SitelinksController < ApplicationController
  
  before_filter :login_required, :except => [:show, :showlist]
  before_filter :user_is_admin, :except => [:show, :showlist]
  
  # GET /sitelinks
  # GET /sitelinks.xml
  def index
    @sitelinks = Sitelink.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @sitelinks }
    end
  end

  def showlist
    @sitelinks = Sitelink.all

    respond_to do |format|
      format.html
    end
  end

  # GET /sitelinks/1
  # GET /sitelinks/1.xml
  def show
    @sitelink = Sitelink.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @sitelink }
    end
  end

  # GET /sitelinks/new
  # GET /sitelinks/new.xml
  def new
    @sitelink = Sitelink.new
    @sitelink.preferredpage = "DEFAULT"
    @preferredpages = Preferredpage.find(:all)

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @sitelink }
    end
  end

  # GET /sitelinks/1/edit
  def edit
    @sitelink = Sitelink.find(params[:id])
    @preferredpages = Preferredpage.find(:all)
  end

  # POST /sitelinks
  # POST /sitelinks.xml
  def create
    @sitelink = Sitelink.new(params[:sitelink])
    @preferredpages = Preferredpage.find(:all)

    respond_to do |format|
      if @sitelink.save
        flash[:notice] = 'Sitelink was successfully created.'
        format.html { redirect_to(@sitelink) }
        format.xml  { render :xml => @sitelink, :status => :created, :location => @sitelink }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @sitelink.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /sitelinks/1
  # PUT /sitelinks/1.xml
  def update
    @sitelink = Sitelink.find(params[:id])
    @preferredpages = Preferredpage.find(:all)

    respond_to do |format|
      if @sitelink.update_attributes(params[:sitelink])
        flash[:notice] = 'Sitelink was successfully updated.'
        format.html { redirect_to(@sitelink) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @sitelink.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /sitelinks/1
  # DELETE /sitelinks/1.xml
  def destroy
    @sitelink = Sitelink.find(params[:id])
    @sitelink.destroy

    respond_to do |format|
      format.html { redirect_to(sitelinks_url) }
      format.xml  { head :ok }
    end
  end
end
