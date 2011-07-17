# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def get_site_text(key)
    st = Sitetext.find_by_textkey(key)
    if st != nil 
      return st.sitetext
    end
    return " "
  end

  def truncate_words(text, length, end_string = ' …')
    words = text.split()
    words[0..(length-1)].join(' ') + (words.length > length ? end_string : '')
  end
  
  def show_date(date)
    date.strftime("%B %d, %Y")
  end
  
  FLASH_NOTICE_KEYS = [:error, :notice, :warning]

    def flash_messages
      return unless messages = flash.keys.select{|k| FLASH_NOTICE_KEYS.include?(k)}
      formatted_messages = messages.map do |type|      
        content_tag :div, :class => type.to_s do
          message_for_item(flash[type], flash["#{type}_item".to_sym])
        end
      end
      formatted_messages.join
    end

    def message_for_item(message, item = nil)
      if item.is_a?(Array)
        message % link_to(*item)
      else
        message % item
      end
    end
    
    def generate_hreftag(url, title, popup)
      if popup
			  return "<a href=\"javascript:doWindowPopup('" + url  + "');\">"
      end

		  return "<a href='" + url  + "'>"
      
    end

    def generate_articles_hreftag(url, title, popup)
      if popup
			  return "<a href=\"javascript:doWindowPopup('" + url  + "');\">"
      end

		  return "<a href='" + url  + "'>"
      
    end

    def news_hreftag(url, title, popup, id)
      
      if url == nil || url == ""
        url = "/latestinfos/show/" + id.to_s
        popup = false
      end
      
      if popup
			  return "<a href=\"javascript:doWindowPopup('" + url  + "');\">" + title + "</a>"
      end

		  "<a href='" + url  + "'>" + title + "</a>"
      
    end
  
end
