ActionController::Routing::Routes.draw do |map|
  map.resources :friendsofusers

  map.resources :testings

  map.resources :sitetexts

  map.resources :testimonials

  map.resources :sitelinks

  map.resources :latestinfos


  map.resources :documents
  map.resources :articles
  map.resources :messages
  map.resources :listings
  map.resources :users
  map.resource :session
  map.resource :listingphotos

  map.root :controller => "home"
  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.register '/register', :controller => 'users', :action => 'create'
  map.signup '/signup', :controller => 'users', :action => 'new'
  map.addlisting '/addlisting', :controller => 'listings', :action => 'new'
  map.showmylistings '/showmylistings', :controller => 'listings', :action => 'index'
  map.listingssearch '/listingssearch', :controller => 'listings', :action => 'listingssearch'
  map.savetofavorites '/savetofavorites', :controller => 'listings', :action => 'savetofavorites'
  map.showmyfavorites '/showmyfavorites', :controller => 'listings', :action => 'showmyfavorites'
  map.removemyfavorite '/removemyfavorite', :controller => 'listings', :action => 'removemyfavorite'
  map.contactagent '/contactagent', :controller => 'messages', :action => 'new'
  map.mysentmessages "/mysentmessages", :controller => 'messages', :action => 'mysentmessages'
  map.myreceivedmessages "/myreceivedmessages", :controller => 'messages', :action => 'myreceivedmessages'
  map.homepageflashplayer "/homepageflashplayer", :controller => 'listingphotos', :action => 'homepageflashplayer'
  map.administration "/administration", :controller => "administration", :action => 'adminmain'
  map.mlssearch "/mlssearch", :controller => 'listings', :action => 'mlssearch'
  map.aboutus "/aboutus", :controller => 'staticpages', :action => 'aboutus'
  map.contactus "/contactus", :controller => 'staticpages', :action => 'contactus'
  map.tandc "/tandc", :controller => 'staticpages', :action => 'termsandconditions'
  map.privacy "/privacy", :controller => 'staticpages', :action => 'privacy'
  map.pubdocuments "/pubdocuments", :controller => 'staticpages', :action => 'pubdocuments'
  map.pubtestimonials "/pubtestimonials", :controller => 'staticpages', :action => 'pubtestimonials'
  map.publistinglist "/publistinglist", :controller => 'staticpages', :action => 'publistinglist'
  map.userprofile "/userprofile", :controller => 'users', :action => 'show'
  map.myprofile "/myprofile", :controller => 'users', :action => 'edit'
  map.forgotpassword "/forgotpassword", :controller => 'users', :action => 'forgotpassword'
  map.sharelisting "/sharelisting", :controller => 'listings', :action => 'sharelisting'
  map.sendsharelisting "/sendsharelisting", :controller => 'listings', :action => 'sendsharelisting'
  map.showarticles "/showarticles", :controller => 'articles', :action => 'showlist'
  map.showlinks "/showlinks", :controller => 'sitelinks', :action => 'showlist'
  map.deletephoto "/deletephoto", :controller => 'listingphotos', :action => 'destroy'
  map.buyerinfo "/buyerinfo", :controller => 'staticpages', :action => 'buyerinfo'
  map.sellerinfo "/sellerinfo", :controller => 'staticpages', :action => 'sellerinfo'
  map.listbook "/listbook", :controller => 'listings', :action => 'listbook'
    
  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  # map.root :controller => "welcome"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing the them or commenting them out if you're using named routes and resources.
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
