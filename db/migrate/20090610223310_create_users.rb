class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table "users", :force => true do |t|
      t.column :login,                     :string, :limit => 40
      t.column :firstname,                 :string, :limit => 100, :default => '', :null => true
      t.column :lastname,                  :string, :limit => 100, :default => '', :null => true
      t.column :email,                     :string, :limit => 100
      t.column :address2,                  :string, :limit => 100, :default => '', :null => true
      t.column :city,                      :string, :limit => 100, :default => '', :null => true
      t.column :state,                     :string, :limit => 100, :default => '', :null => true
      t.column :zip,                       :string, :limit => 100, :default => '', :null => true
      t.column :email,                     :string, :limit => 255, :default => '', :null => true
      t.column :phone,                     :string, :limit => 100, :default => '', :null => true
      t.column :is_admin,                  :boolean
      t.column :crypted_password,          :string, :limit => 40
      t.column :salt,                      :string, :limit => 40
      t.column :created_at,                :datetime
      t.column :updated_at,                :datetime
      t.column :remember_token,            :string, :limit => 40
      t.column :remember_token_expires_at, :datetime


    end
    add_index :users, :login, :unique => true
  end

  def self.down
    drop_table "users"
  end
end
