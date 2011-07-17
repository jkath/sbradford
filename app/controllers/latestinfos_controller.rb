class LatestinfosController < ApplicationController
  
  before_filter :login_required, :except => [:show]
  before_filter :user_is_admin, :except => [:show]  
  
  # GET /latestinfos
  # GET /latestinfos.xml
  def index
    @latestinfos = Latestinfo.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @latestinfos }
    end
  end

  # GET /latestinfos/1
  # GET /latestinfos/1.xml
  def show
    @latestinfo = Latestinfo.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @latestinfo }
    end
  end

  # GET /latestinfos/new
  # GET /latestinfos/new.xml
  def new
    @latestinfo = Latestinfo.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @latestinfo }
    end
  end

  # GET /latestinfos/1/edit
  def edit
    @latestinfo = Latestinfo.find(params[:id])
  end

  # POST /latestinfos
  # POST /latestinfos.xml
  def create
    @latestinfo = Latestinfo.new(params[:latestinfo])

    respond_to do |format|
      if @latestinfo.save
        flash[:notice] = 'Latestinfo was successfully created.'
        format.html { redirect_to(@latestinfo) }
        format.xml  { render :xml => @latestinfo, :status => :created, :location => @latestinfo }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @latestinfo.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /latestinfos/1
  # PUT /latestinfos/1.xml
  def update
    @latestinfo = Latestinfo.find(params[:id])

    respond_to do |format|
      if @latestinfo.update_attributes(params[:latestinfo])
        flash[:notice] = 'Latestinfo was successfully updated.'
        format.html { redirect_to(@latestinfo) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @latestinfo.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /latestinfos/1
  # DELETE /latestinfos/1.xml
  def destroy
    @latestinfo = Latestinfo.find(params[:id])
    @latestinfo.destroy

    respond_to do |format|
      format.html { redirect_to(latestinfos_url) }
      format.xml  { head :ok }
    end
  end
end
