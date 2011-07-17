class DocumentsController < ApplicationController
  
  before_filter :login_required
  before_filter :user_is_admin
  
  # GET /documents
  # GET /documents.xml
  def index
    @documents = Document.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @documents }
    end
  end

  # GET /documents/1
  # GET /documents/1.xml
  def show
    @document = Document.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @document }
    end
  end

  # GET /documents/new
  # GET /documents/new.xml
  def new
    @document = Document.new
    @preferredpages = Preferredpage.find(:all)

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @document }
    end
  end

  # GET /documents/1/edit
  def edit
    @document = Document.find(params[:id])
    @preferredpages = Preferredpage.find(:all)
  end

  # POST /documents
  # POST /documents.xml
  def create
    @document = Document.new(params[:document])
    @preferredpages = Preferredpage.find(:all)

    respond_to do |format|
      if @document.save
        @documents = Document.all
        flash[:notice] = 'Document was successfully created.'
        format.html { render :action => "index" }
        format.xml  { render :xml => @document, :status => :created, :location => @document }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @document.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /documents/1
  # PUT /documents/1.xml
  def update
    @document = Document.find(params[:id])
    @preferredpages = Preferredpage.find(:all)

    respond_to do |format|
      if @document.update_attributes(params[:document])
        @documents = Document.all
        flash[:notice] = 'Document was successfully updated.'
        format.html { render :action => "index" }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @document.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /documents/1
  # DELETE /documents/1.xml
  def destroy
    @document = Document.find(params[:id])
    @document.destroy

    respond_to do |format|
      format.html { redirect_to(documents_url) }
      format.xml  { head :ok }
    end
  end
end
