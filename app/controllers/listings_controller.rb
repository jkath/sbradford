class ListingsController < ApplicationController
  before_filter :login_required, :except => [:show, :listingssearch, :mlssearch, :listbook]
  before_filter :user_is_admin, :except => [:show, :listingssearch, :mlssearch, :listbook, :savetofavorites, :sharelisting, :sendsharelisting, :showmyfavorites, :removemyfavorites]
    
  def listingssearch
    
    @usstates = Usstate.find(:all)
    @pricelistfrom = Pricelist.find_all_ascending()
    @pricelistto = Pricelist.find_all_descending()
    
    flash[:notice] = ""
    
    
    tmp = params[:searchcriteria]
    if tmp == nil #Was the search form NOT submitted
				@searchcriteria = session[:searchcriteria] #Okay, then see if we have one in the session
				if @searchcriteria == nil #If not, then create a new, fresh one
					@searchcriteria = Searchcriteria.new(nil)
					session[:searchcriteria] = @searchcriteria
				end
    else #Else lets use the one from the submission form
      @searchcriteria = Searchcriteria.new(params[:searchcriteria])
    end
    
    session[:searchcriteria] = @searchcriteria
    
    #conditions are for fields
    srchconditions = Hash.new
    srchconditions[:statecode] = @searchcriteria.statecode unless @searchcriteria.statecode == "" || @searchcriteria.statecode == nil
    srchconditions[:city] = @searchcriteria.city unless @searchcriteria.city == "" || @searchcriteria.city == nil
    srchconditions[:zip] = @searchcriteria.zip unless @searchcriteria.zip == "" || @searchcriteria.zip == nil
    
    #with is for attributes.  This is how we filter.
    srchwith = Hash.new
    if(@searchcriteria.pricefrom != nil)
      srchwith[:price] = @searchcriteria.pricefrom.to_i..@searchcriteria.priceto.to_i
    end
    
    @listings = Listing.search @searchcriteria.srchtoken , :conditions => srchconditions, :with => srchwith,
        :page => params[:page], :per_page => 6
        
    
    respond_to do |format|
        format.html # listingssearch.html.erb
    end
    
  end

  def mlssearch
    
  end
  
  def savetofavorites
  
    flash[:notice] = ""
    listingid = params[:listingid]
    
    fav = Favorite.new
    fav.user_id = current_user.id
    fav.listing_id = listingid
    fav.save

    if(params[:src] == "list")  
      flash[:notice] = "Successfully Saved To Favorites"
      redirect_to :action => "listingssearch"
    else
      redirect_to :action => "show", :id => listingid
    end
  end
  
  def sharelisting
    
    @listingid = params[:listingid]
    
    respond_to do |format|
      format.html
    end
  
  end
  
  def sendsharelisting
    
    if params[:email].blank?
      flash[:notice] = "Email was blank!"      
      redirect_to :action => 'sharelisting'
    end
      
    
    fullname = current_user.firstname + " " + current_user.lastname
    Notifier.deliver_sharelisting("shawn@shawnbradfordteam.com", params[:email], fullname, params[:listingid], request.host_with_port)
  
    #Now save the friend's contact info
    friend = Friendsofuser.new
    friend.firstname = params[:firstname]
    friend.lastname = params[:lastname]
    friend.email = params[:email]
    friend.user_id = current_user.id
    friend.save
    
  end
  
  def showmyfavorites
    
    favorites = current_user.favorites
    
    @listings = Array.new
    
    if(favorites)
      favorites.each do |f|
        @listings << Listing.find(f.listing_id)
      end
    end
    
  end
  
  def removemyfavorite
    
    listingid = params[:listingid]
    Favorite.delete_all("listing_id = " + params[:listingid] + " AND user_id = " + current_user.id.to_s)
    
    redirect_to :action => "showmyfavorites"
  
  end

  def index
    @listings = Listing.find_by_userid(current_user.id)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @listings }
    end
  end

  def show
    @listing = Listing.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @listing }
    end
  end
  
  def new
    @listing = Listing.new
    @usstates = Usstate.find(:all)

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @listing }
    end
  end

  def edit
    @listing = Listing.find(params[:id])
    @usstates = Usstate.find(:all)
  end

  def create
    @listing = Listing.new(params[:listing])
    @usstates = Usstate.find(:all)

    respond_to do |format|
      if @listing.save
        flash[:notice] = 'Listing was successfully created.'
        format.html { redirect_to(@listing) }
        format.xml  { render :xml => @listing, :status => :created, :location => @listing }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @listing.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    @listing = Listing.find(params[:id])
    @usstates = Usstate.find(:all)

    respond_to do |format|
      if @listing.update_attributes(params[:listing])
        flash[:notice] = 'Listing was successfully updated.'
        format.html { redirect_to(@listing) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @listing.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /listings/1
  # DELETE /listings/1.xml
  def destroy
    @listing = Listing.find(params[:id])
    @listing.destroy

    respond_to do |format|
      format.html { redirect_to(listings_url) }
      format.xml  { head :ok }
    end
  end
end
