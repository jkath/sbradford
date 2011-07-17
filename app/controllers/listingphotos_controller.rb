class ListingphotosController < ApplicationController
  layout "application", :except => [ :show ]
  
  
  def homepageflashplayer
    
    listings = Listing.find(:all)
    @photos = Array.new
    listings.each do |l|
      
      photos_tmp = l.listingphoto
      
      photos_tmp.each do |p|
        @photos << p
      end
      
      @photos.sort {rand}
      
    end
    
    respond_to do |format|
        format.xml {}
    end
    
  end
  
  def new
    
    listingid = session[:listingid]
    if listingid == nil
      listingid = params[:listingid]
    end
    session[:listingid] = nil
    
    @listing = Listing.find(listingid)
    @listingphotos = @listing.listingphoto
    @listingphoto = Listingphoto.new
    
  end
  
  def show
    @photo = Listingphoto.find(params[:id])
  end
  
  def create
    @listingphoto = Listingphoto.new(params[:listingphoto])
    @listing = Listing.find(@listingphoto.listing_id)
    @listingphotos = @listing.listingphoto

    respond_to do |format|
      if @listingphoto.save
        flash[:notice] = 'Photo Uploaded Successfully.'
        format.html { redirect_to :action => 'new', :listingid => @listingphoto.listing.id }
      else
        format.html { render :action => "new" }
      end
    end
  end
  
  def destroy
    
    session[:listingid] = params[:listingid]
    
    @photo = Listingphoto.find(params[:id])

    @listing = Listing.find(@photo.listing_id)
    @listingphotos = @listing.listingphoto
    @listingphoto = Listingphoto.new

    @photo.destroy

    respond_to do |format|
      format.html { redirect_to :action => 'new' }
      format.xml  { head :ok }
    end
  end
  
end
