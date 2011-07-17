photos = @photos

xml.playlist do #generates playlist tag
  xml.trackList do #generates tracklist tag
    
  	photos.each do | track |
    
     listing = Listing.find(track.listing_id)
    
  	 xml.track do
  		  xml.title(track.description)
  		  xml.creator("")
        xml.location("http://" + request.host_with_port + "/system/listingphotos/" + track.id.to_s + "/medium.jpg")
        xml.info("http://" + request.host_with_port + "/listings/" + listing.id.to_s)
  	 end #End of track
  	end #End of photos loop
  	
  end #End trackList
end #End of playlist
