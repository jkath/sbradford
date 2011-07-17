class Notifier < ActionMailer::Base
  
  def newpassword(sender, recipient, newpassword)
      subject    "Your new password."
      body       :newpassword => newpassword
      recipients [recipient]
      from       sender
      sent_on    Time.now
  end

  def sharelisting(sender, recipient, sendername, listingid, url)
      subject    sendername + " Wants you to see this property!"
      body       :sendername => sendername, :listingid => listingid, :url => url
      recipients [recipient]
      from       sender
      sent_on    Time.now
  end
  
end
