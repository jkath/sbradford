# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_realestate_session',
  :secret      => '5f4dd95663ae79f948a7ae7b3894b8e55884375be0ce5d2c25c0d7071ac985c8a73e1dd077997d8dbbdfd6ff19b43ef2d6c2df20d7c6d111b73b01d311c635c0'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
