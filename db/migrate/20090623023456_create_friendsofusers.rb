class CreateFriendsofusers < ActiveRecord::Migration
  def self.up
    create_table :friendsofusers do |t|
      t.string :firstname
      t.string :lastname
      t.string :email
      t.integer :user_id

      t.timestamps
    end
  end

  def self.down
    drop_table :friendsofusers
  end
end
