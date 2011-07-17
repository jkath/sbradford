# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090624221406) do

  create_table "articles", :force => true do |t|
    t.string   "title"
    t.boolean  "as_popup"
    t.text     "description"
    t.integer  "sortorder",   :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "documents", :force => true do |t|
    t.string   "title"
    t.boolean  "as_popup"
    t.text     "description"
    t.string   "document_file_name"
    t.string   "document_content_type"
    t.integer  "document_file_size"
    t.integer  "sortorder",                           :null => false
    t.string   "preferredpage",         :limit => 30, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "favorites", :force => true do |t|
    t.integer  "user_id"
    t.integer  "listing_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "friendsofusers", :force => true do |t|
    t.string   "firstname"
    t.string   "lastname"
    t.string   "email"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "latestinfos", :force => true do |t|
    t.string   "title"
    t.string   "link"
    t.boolean  "as_aspopup"
    t.boolean  "is_active"
    t.text     "description"
    t.integer  "sortorder",   :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "listingphotos", :force => true do |t|
    t.integer  "listing_id"
    t.string   "description",        :limit => 30, :null => false
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "listings", :force => true do |t|
    t.integer  "user_id"
    t.string   "title"
    t.text     "description"
    t.integer  "beds"
    t.integer  "baths",       :limit => 10,  :precision => 10, :scale => 0
    t.string   "location"
    t.string   "statecode",   :limit => 4,                                  :null => false
    t.string   "city",        :limit => 100,                                :null => false
    t.string   "zip",         :limit => 10,                                 :null => false
    t.integer  "price"
    t.integer  "taxes"
    t.string   "taxyear"
    t.text     "otherinfo"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "messages", :force => true do |t|
    t.integer  "user_id"
    t.integer  "recipient_id"
    t.integer  "parent_message"
    t.string   "subject"
    t.text     "message"
    t.boolean  "hasbeenread"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "news", :force => true do |t|
    t.string   "title"
    t.string   "link"
    t.boolean  "as_aspopup"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "preferredpages", :force => true do |t|
    t.string   "pagevalue"
    t.string   "pagedescription"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "pricelists", :force => true do |t|
    t.integer  "pricevalue", :default => 0
    t.string   "pricelabel"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "sitelinks", :force => true do |t|
    t.string   "title"
    t.string   "url"
    t.boolean  "is_popup",                         :null => false
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.integer  "sortorder"
    t.string   "preferredpage",      :limit => 30, :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sitetexts", :force => true do |t|
    t.string   "textkey"
    t.text     "sitetext"
    t.boolean  "is_active"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "testimonials", :force => true do |t|
    t.string   "title"
    t.string   "fullname"
    t.text     "testimonial"
    t.integer  "sortorder"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "testings", :force => true do |t|
    t.string   "test"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "firstname",                 :limit => 100, :default => ""
    t.string   "lastname",                  :limit => 100, :default => ""
    t.string   "email",                                    :default => ""
    t.string   "address2",                  :limit => 100, :default => ""
    t.string   "city",                      :limit => 100, :default => ""
    t.string   "state",                     :limit => 100, :default => ""
    t.string   "zip",                       :limit => 100, :default => ""
    t.string   "phone",                     :limit => 100, :default => ""
    t.boolean  "is_admin"
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

  create_table "usstates", :force => true do |t|
    t.string   "statecode"
    t.string   "statename"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
